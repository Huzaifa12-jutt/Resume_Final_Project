const CardSkeleton = () => {

    return (

        <div className="

        animate-pulse

        bg-white

        rounded-2xl

        p-6

        border">

            <div className="h-6 w-1/2 bg-slate-200 rounded"/>

            <div className="h-4 w-full bg-slate-200 rounded mt-4"/>

            <div className="h-4 w-5/6 bg-slate-200 rounded mt-2"/>

            <div className="h-10 w-32 bg-slate-200 rounded-xl mt-6"/>

        </div>

    );

};

export default CardSkeleton;