import Navbar from "../components/layout/Navbar";
import Container from "../components/common/Container";

const MainLayout = ({ children }) => {

    return (

        <div className="min-h-screen bg-slate-50">

            <Navbar/>

            <Container>

                <main className="py-10">

                    {children}

                </main>

            </Container>

        </div>

    );

};

export default MainLayout;