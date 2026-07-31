import Card from "./Card";
import Button from "./Button";

const JobCard = ({ job }) => {

    return (

        <Card className="flex flex-col justify-between">

            <div>

                <h2 className="text-xl font-semibold">

                    {job.title}

                </h2>

                <p className="mt-2 text-slate-600">

                    {job.company}

                </p>

                <p className="mt-4 text-slate-500 line-clamp-3">

                    {job.description}

                </p>

            </div>

            <Button className="mt-6">

                View Details

            </Button>

        </Card>

    );

};

export default JobCard;