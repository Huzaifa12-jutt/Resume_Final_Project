import { Link } from "react-router-dom";
import { FiUploadCloud, FiBriefcase } from "react-icons/fi";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="py-24">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
            AI-Powered Resume Screening
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 lg:text-6xl">
            Find the Right Job With Intelligent Resume Analysis
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Upload your resume, compare it against job descriptions,
            receive AI-powered feedback, and improve your chances of
            getting shortlisted.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/upload">
              <Button>
                <FiUploadCloud className="mr-2 inline" />
                Upload Resume
              </Button>
            </Link>

            <Link to="/jobs">
              <Button variant="outline">
                <FiBriefcase className="mr-2 inline" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex h-[450px] w-full max-w-md items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl">
            <span className="text-slate-400">
              Hero Illustration
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;