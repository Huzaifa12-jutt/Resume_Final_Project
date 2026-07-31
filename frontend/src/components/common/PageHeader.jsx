const PageHeader = ({ title, subtitle }) => {

    return (

        <div className="mb-10">

            <h1 className="text-4xl font-bold">

                {title}

            </h1>

            <p className="mt-2 text-slate-500">

                {subtitle}

            </p>

        </div>

    );

};

export default PageHeader;