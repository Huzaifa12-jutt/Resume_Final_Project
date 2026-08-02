"""
gmail_fetcher.py
----------------
Gmail API integration for fetching resumes via OAuth 2.0.
Handles authentication, email fetching, and attachment processing.
"""

import os
import base64
import io
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dotenv import load_dotenv
from .resume_parser import parse_resume

load_dotenv()


def _google():
    """Lazily import the Google API client libraries.

    These are heavyweight, optional dependencies that are only needed for
    the Gmail resume-fetching feature. Importing them on demand (instead of
    at module load) keeps the rest of the backend fully bootable even when
    they aren't installed, and raises a clear, actionable error if the
    Gmail feature is actually used without them.
    """
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import Flow
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
        import google.auth.transport.requests
    except ImportError as exc:
        raise RuntimeError(
            "Gmail integration requires the Google API client libraries. "
            "Install them with: pip install google-auth google-auth-oauthlib google-api-python-client"
        ) from exc
    return Credentials, Flow, build, HttpError, google.auth.transport.requests

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
RESUME_KEYWORDS = ['resume', 'cv', 'application', 'job', 'career', 'position', 'candidate']
ATTACHMENT_TYPES = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/msword',
    'application/rtf',
    'text/plain',
    'application/octet-stream'
]


class GmailFetcher:
    """Gmail API integration for fetching resumes"""

    @staticmethod
    def get_flow(redirect_uri: Optional[str] = None):
        """Create OAuth flow for Gmail authentication.

        ``redirect_uri`` defaults to GMAIL_REDIRECT_URI (or the documented
        callback path), but callers can override it with the exact URL the
        OAuth callback actually landed on — this keeps the token exchange in
        sync with whatever redirect URI the authorization request used.
        """
        _, Flow, _, _, _ = _google()
        client_id = os.getenv("GMAIL_CLIENT_ID")
        client_secret = os.getenv("GMAIL_CLIENT_SECRET")
        # Must point at the actual callback route (not the API root) so Google
        # redirects the browser back to a handler that can exchange the code.
        redirect_uri = redirect_uri or os.getenv("GMAIL_REDIRECT_URI", "http://localhost:8000/gmail/auth/callback")
        
        if not client_id or not client_secret:
            raise RuntimeError("GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in environment")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=SCOPES
        )
        flow.redirect_uri = redirect_uri
        return flow

    @staticmethod
    def get_auth_url(state: Optional[str] = None) -> str:
        """Generate OAuth authorization URL.

        ``state`` is echoed back unchanged by Google on the callback, so the
        caller can pass the logged-in user's id through to identify them.
        """
        flow = GmailFetcher.get_flow()
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state,
        )
        return auth_url

    @staticmethod
    def exchange_code_for_token(code: str, redirect_uri: Optional[str] = None) -> Dict:
        """Exchange authorization code for access token.

        ``redirect_uri`` is passed through to :meth:`get_flow` so the exchange
        uses the same redirect URI that the authorization request used — this
        is what makes a callback landing on the bare root (instead of
        /gmail/auth/callback) still complete successfully.
        """
        flow = GmailFetcher.get_flow(redirect_uri=redirect_uri)
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        return {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_expiry': credentials.expiry.isoformat() if credentials.expiry else None,
            'email': GmailFetcher.get_user_email(credentials)
        }

    @staticmethod
    def get_user_email(credentials) -> Optional[str]:
        """Get user email from Gmail API"""
        try:
            _, _, build, _, _ = _google()
            service = build('gmail', 'v1', credentials=credentials)
            profile = service.users().getProfile(userId='me').execute()
            return profile.get('emailAddress')
        except Exception as e:
            print(f"Error getting user email: {e}")
            return None

    @staticmethod
    def credentials_from_token(token_data: Dict):
        """Create Credentials object from stored token data"""
        Credentials, _, _, _, _ = _google()
        expiry = None
        if token_data.get('token_expiry'):
            expiry = datetime.fromisoformat(token_data['token_expiry'])
        
        credentials = Credentials(
            token=token_data['access_token'],
            refresh_token=token_data.get('refresh_token'),
            token_uri='https://oauth2.googleapis.com/token',
            client_id=os.getenv("GMAIL_CLIENT_ID"),
            client_secret=os.getenv("GMAIL_CLIENT_SECRET"),
            expiry=expiry
        )
        return credentials

    @staticmethod
    def refresh_credentials(credentials):
        """Refresh expired credentials"""
        if credentials.expired and credentials.refresh_token:
            _, _, _, _, requests = _google()
            credentials.refresh(requests.Request())
        return credentials

    @staticmethod
    def fetch_emails_with_attachments(credentials) -> List[Dict]:
        """Fetch emails with PDF/DOC attachments from INBOX and SPAM"""
        print(f"\n🔵 === FETCHING EMAILS FROM GMAIL ===")
        try:
            _, _, build, HttpError, _ = _google()
            credentials = GmailFetcher.refresh_credentials(credentials)
            print(f"🔵 Credentials refreshed")
            service = build('gmail', 'v1', credentials=credentials)
            print(f"🔵 Gmail service created")
            
            all_emails = []
            folders = ['INBOX', 'SPAM']
            fetch_limit = int(os.getenv("GMAIL_FETCH_LIMIT", "50"))
            print(f"🔵 Fetch limit: {fetch_limit}")
            print(f"🔵 Folders to search: {folders}")
            
            for folder in folders:
                print(f"\n🔵 Searching in folder: {folder}")
                query = 'has:attachment'
                print(f"🔵 Search query: {query}")
                results = service.users().messages().list(
                    userId='me',
                    q=query,
                    labelIds=[folder],
                    maxResults=fetch_limit
                ).execute()
                
                messages = results.get('messages', [])
                print(f"🔵 Messages found in {folder}: {len(messages)}")
                
                for message in messages:
                    msg_data = GmailFetcher.get_message_with_attachments(service, message['id'])
                    if msg_data:
                        msg_data['folder'] = folder
                        all_emails.append(msg_data)
                        print(f"✅ Found email with attachments in {folder}: {msg_data['subject']} - {len(msg_data['attachments'])} attachments")
            
            print(f"\n🔵 === EMAIL FETCH COMPLETE ===")
            print(f"🔵 Total emails with attachments: {len(all_emails)}")
            return all_emails
            
        except HttpError as e:
            print(f"🔴 Gmail API error: {e}")
            return []
        except Exception as e:
            print(f"🔴 Error fetching emails: {e}")
            return []

    @staticmethod
    def get_message_with_attachments(service, message_id: str) -> Optional[Dict]:
        """Get message details and download attachments"""
        try:
            message = service.users().messages().get(userId='me', id=message_id).execute()
            
            subject = ""
            for header in message['payload'].get('headers', []):
                if header['name'].lower() == 'subject':
                    subject = header['value']
                    break
            
            sender = ""
            for header in message['payload'].get('headers', []):
                if header['name'].lower() == 'from':
                    sender = header['value']
                    break
            
            attachments = []
            parts = message['payload'].get('parts', [])
            
            def find_attachments(parts):
                for part in parts:
                    if part.get('filename'):
                        filename = part['filename'].lower()
                        mime_type = part.get('mimeType', '')
                        
                        is_valid_mime = mime_type in ATTACHMENT_TYPES
                        is_valid_extension = any(filename.endswith(ext) for ext in ['.pdf', '.doc', '.docx', '.rtf', '.txt'])
                        
                        if is_valid_mime or is_valid_extension:
                            attachment_id = part['body'].get('attachmentId')
                            if attachment_id:
                                attachment_data = service.users().messages().attachments().get(
                                    userId='me',
                                    messageId=message_id,
                                    id=attachment_id
                                ).execute()
                                
                                file_data = base64.urlsafe_b64decode(attachment_data['data'])
                                
                                attachments.append({
                                    'filename': part['filename'],
                                    'mime_type': mime_type,
                                    'data': file_data
                                })
                    
                    if part.get('parts'):
                        find_attachments(part['parts'])
            
            find_attachments(parts)
            
            if attachments:
                return {
                    'id': message_id,
                    'subject': subject,
                    'sender': sender,
                    'attachments': attachments
                }
            
            return None
            
        except Exception as e:
            print(f"Error getting message: {e}")
            return None

    @staticmethod
    def process_emails_to_candidates(emails: List[Dict], supabase=None, job_id: str = None) -> Tuple[List[Dict], int]:
        """Process emails, extract candidate data, and SAVE to database with UPSERT"""
        candidates = []
        saved_count = 0
        
        print(f"\n=== Starting email processing ===")
        print(f"Total emails to process: {len(emails)}")
        
        for email in emails:
            print(f"\n--- Processing email: {email.get('subject', 'No subject')} ---")
            print(f"Email ID: {email.get('id')}")
            print(f"Folder: {email.get('folder')}")
            print(f"Sender: {email.get('sender')}")
            
            attachments = email.get('attachments', [])
            print(f"Attachments found: {len(attachments)}")
            
            for attachment in attachments:
                print(f"\n  Attachment: {attachment.get('filename')}")
                print(f"  MIME type: {attachment.get('mime_type')}")
                print(f"  Data size: {len(attachment.get('data', []))} bytes")
                
                try:
                    is_pdf = attachment['mime_type'] == 'application/pdf' or attachment['filename'].lower().endswith('.pdf')
                    print(f"  Is PDF: {is_pdf}")
                    
                    if is_pdf:
                        print(f"  → Attempting to parse PDF...")
                        try:
                            parsed_data = parse_resume(io.BytesIO(attachment['data']), attachment['filename'])
                            print(f"  → Parser returned data with keys: {parsed_data.keys() if parsed_data else 'None'}")
                            print(f"  → Name from parser: {parsed_data.get('name') if parsed_data else 'None'}")
                            
                            if not parsed_data or not parsed_data.get('name'):
                                print(f"  ⚠️ Parser returned empty data, using fallback")
                                parsed_data = {
                                    'name': attachment['filename'].replace('.pdf', '').replace('_', ' ').title(),
                                    'email': '',
                                    'phone': '',
                                    'skills': [],
                                    'education': '',
                                    'experience': '',
                                    'certifications': '',
                                    'projects': '',
                                    'raw_text': ''
                                }
                        except Exception as e:
                            print(f"  ❌ Parser error: {e}")
                            parsed_data = {
                                'name': attachment['filename'].replace('.pdf', '').replace('_', ' ').title(),
                                'email': '',
                                'phone': '',
                                'skills': [],
                                'education': '',
                                'experience': '',
                                'certifications': '',
                                'projects': '',
                                'raw_text': ''
                            }
                        
                        # Add Gmail metadata
                        parsed_data['source'] = 'gmail'
                        parsed_data['gmail_message_id'] = email['id']
                        parsed_data['gmail_sender'] = email.get('sender', '')
                        parsed_data['gmail_subject'] = email.get('subject', '')
                        parsed_data['gmail_folder'] = email.get('folder', '')
                        parsed_data['filename'] = attachment['filename']
                        
                        # UPSERT with database
                        if supabase and job_id:
                            parsed_data['job_id'] = job_id
                            result = GmailFetcher._upsert_candidate(supabase, parsed_data)
                            if result:
                                saved_count += 1
                                print(f"  ✅ Candidate saved/updated: {parsed_data.get('name')}")
                            else:
                                print(f"  ❌ Failed to save candidate")
                        else:
                            print(f"  ⚠️ No database connection, candidate not saved")
                        
                        candidates.append(parsed_data)
                        print(f"  ✅ Candidate added to list. Total candidates: {len(candidates)}")
                    else:
                        print(f"  ⏭️ Skipping non-PDF file")
                
                except Exception as e:
                    print(f"  ❌ Error processing attachment: {e}")
                    continue
        
        print(f"\n=== Email processing complete ===")
        print(f"Total candidates created: {len(candidates)}")
        print(f"Total candidates saved/updated: {saved_count}")
        
        return candidates, saved_count

    @staticmethod
    def _upsert_candidate(supabase, candidate_data: Dict) -> Optional[Dict]:
        """Upsert candidate: update if exists, insert if new"""
        try:
            email = candidate_data.get('email', '')
            job_id = candidate_data.get('job_id')
            
            # Try to find existing candidate by email + job_id
            existing = None
            if email and job_id:
                result = supabase.table('candidates').select('id').eq('email', email).eq('job_id', job_id).execute()
                if result.data:
                    existing = result.data[0]
            
            if existing:
                # UPDATE existing
                candidate_id = existing['id']
                update_data = {k: v for k, v in candidate_data.items() if k not in ['id', 'created_at', 'gmail_message_id']}
                result = supabase.table('candidates').update(update_data).eq('id', candidate_id).execute()
                print(f"  🔄 Updated existing candidate: {candidate_data.get('name')}")
                return result.data[0] if result.data else True
            else:
                # INSERT new
                result = supabase.table('candidates').insert(candidate_data).execute()
                print(f"  ✅ Inserted new candidate: {candidate_data.get('name')}")
                return result.data[0] if result.data else True
                
        except Exception as e:
            print(f"  ❌ Upsert error: {e}")
            return None

    @staticmethod
    def exchange_code(code: str) -> Dict:
        """Exchange authorization code for tokens"""
        flow = GmailFetcher.get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        email = None
        try:
            _, _, build, _, _ = _google()
            service = build('gmail', 'v1', credentials=credentials)
            profile = service.users().getProfile(userId='me').execute()
            email = profile.get('emailAddress')
        except Exception as e:
            print(f"Error getting email: {e}")
        
        return {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'expiry': credentials.expiry.isoformat() if credentials.expiry else None,
            'email': email
        }