import React from "react";

const ContactPage = () => {
    return (
        <div className="mx-auto mb-20 mt-10 flex w-full max-w-screen-md flex-1 flex-col gap-6">
            <h1 className="text-2xl font-semibold">Contact</h1>
            <article className="flex flex-col items-start gap-2">
                <p>
                    If you need to reach us regarding any store-related issues, you can do so by
                    contacting us at the email address provided below.
                </p>
                <p></p>
                <p>
                    We aim to respond to all inquiries within 24 hours, but we cannot guarantee a
                    specific response time.
                </p>
                <p>
                    Additionally, please be as specific as possible when sending your email, as this
                    will allow us to provide you with a more accurate response.
                </p>
                <p className="mt-8 w-full text-center">
                    Contact:{" "}
                    <a href="mailto: xcosmpolitan2@gmail.com">
                        <strong>
                            <u>cosmpolitan2@gmail.com</u>
                        </strong>
                    </a>
                </p>
            </article>
        </div>
    );
};

export default ContactPage;
