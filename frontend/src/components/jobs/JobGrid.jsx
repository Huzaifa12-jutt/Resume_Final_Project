import JobCard from "./JobCard";

export default function JobGrid({ jobs, onDelete }) {

    return (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {

                jobs.map(job => (

                    <JobCard

                        key={job.id}

                        job={job}

                        onDelete={onDelete}

                    />

                ))

            }

        </div>

    );

}