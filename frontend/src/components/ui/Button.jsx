import clsx from "clsx";

const Button = ({
    children,
    className,
    variant = "primary",
    ...props
}) => {

    const styles = {

        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white",

        secondary:
            "bg-slate-200 hover:bg-slate-300 text-slate-900",

        outline:
            "border border-slate-300 hover:bg-slate-100"

    };

    return (

        <button

            className={clsx(

                "px-5 py-3 rounded-xl font-medium transition duration-200",

                styles[variant],

                className

            )}

            {...props}

        >

            {children}

        </button>

    );

};

export default Button;