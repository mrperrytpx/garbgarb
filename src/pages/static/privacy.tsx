import Link from "next/link";

const PrivacyPage = () => {
    return (
        <div className="mx-auto mb-20 mt-10 flex w-full max-w-screen-md flex-1 flex-col gap-6 p-4 text-white">
            <h1 className="text-2xl font-semibold">Privacy Policy</h1>
            <p className="text-xs">Effective Date: 20th of April, 2023</p>
            <p className="text-sm">
                At GarbGarb, we take your privacy seriously. This policy explains how we collect,
                process, and share your personal information when you use our services or visit our
                Website.
            </p>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Personal Information Collection</h2>
                <p className="text-sm">
                    When you visit this Website, we automatically collect certain information about
                    your device, including information about your web browser, IP address, time
                    zone, and some of the cookies that are installed on your device.
                </p>
                <p className="text-sm">
                    Additionally, as you browse this Website, we collect information about the
                    individual web pages or products that you view.
                </p>
                <p className="text-sm">
                    We refer to this automatically collected information as “Device Information”.
                </p>
                <p className="text-sm">
                    When you use the Webite to make a purchase, we collect various types of
                    information from you, which includes your name, billing and shipping address,
                    payment details (like credit card numbers), email address, and phone number. We
                    refer to this information as "Order Information".
                </p>
                <p className="text-sm">
                    In this Privacy Policy, the term "Personal Information" encompasses both Device
                    Information and Order Information.
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">How We Use Your Personal Data</h2>
                <p className="text-sm">
                    Generally, the Order Information we collect is used to fulfill orders made
                    through the Website, including processing payment information, arranging
                    shipping, and providing invoices and order confirmations. We also utilize this
                    information to:
                </p>
                <ul className="flex list-inside list-disc flex-col">
                    <li className="text-sm">Communicate with you.</li>
                    <li className="text-sm">Screen our orders for potential risk or fraud.</li>
                </ul>
                <p className="text-sm">
                    We use the Device Information that we collect to help us screen for potential
                    risk and fraud (in particular, your IP address), and more generally to improve
                    and optimize our Website (for example, by generating analytics about how our
                    customers browse and interact with the Website)
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">How We Share Your Personal Data</h2>
                <p className="text-sm">
                    We may share your Personal Information with third-party services to facilitate
                    our use of your information, as outlined previously.
                </p>
                <p className="text-sm">
                    For instance, we utilize Printful to operate our online store and fulfill
                    customer orders, and we use Stripe to securely process payments from our
                    customers.
                </p>
                <p className="text-sm">
                    Additionally, we may disclose your Personal Information in response to lawful
                    requests for information, including compliance with applicable laws and
                    regulations or to protect our legal rights.
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Your rights</h2>
                <p className="text-sm">
                    If you are a European resident, you have the right to access personal
                    information we hold about you and to ask that your personal information be
                    corrected, updated, or deleted. If you would like to exercise this right, please{" "}
                    <Link href="/static/contact">
                        <strong>
                            <u>Contact us</u>
                        </strong>
                    </Link>
                </p>
                <p className="text-sm">
                    Additionally, if you are a European resident we note that we are processing your
                    information in order to fulfill contracts we might have with you (for example if
                    you make an order through the Website), or otherwise to pursue our legitimate
                    business interests listed above.
                </p>
                <p className="text-sm">
                    Please note that your information might be transferred outside of Europe,
                    including the United States.
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Data retention</h2>
                <p className="text-sm">
                    When you place an order through the Website, we will maintain your Order
                    Information for our records unless and until you ask us to delete this
                    information.
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Changes to This Privacy Policy</h2>
                <p className="text-sm">
                    We may update this Privacy Policy from time to time. We will post the updated
                    Privacy Policy on our website and update the Effective Date at the top of the
                    Privacy Policy.
                </p>
                <p className="text-sm">
                    Your continued use of our website after we make changes is deemed to be
                    acceptance of those changes, so please check the Privacy Policy periodically for
                    updates.
                </p>
            </article>
            <article className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Contact Us</h2>
                <p className="text-sm">
                    If you have any questions or comments about this Privacy Policy or our practices
                    regarding personal data, please{" "}
                    <Link href="/static/contact">
                        <strong>
                            <u>Contact us</u>
                        </strong>
                    </Link>
                    .
                </p>
            </article>
        </div>
    );
};

export default PrivacyPage;
