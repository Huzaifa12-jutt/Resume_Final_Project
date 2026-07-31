const Input = ({ label, error, ...props }) => {

    return (

        <div className="space-y-2">

            <label className="text-sm font-medium">

                {label}

            </label>

            <input

                {...props}

                className="

                w-full

                rounded-xl

                border

                border-slate-300

                px-4

                py-3

                outline-none

                focus:ring-2

                focus:ring-indigo-500

                "

            />

            {

                error && (

                    <p className="text-sm text-red-500">

                        {error}

                    </p>

                )

            }

        </div>

    );

};

export default Input;