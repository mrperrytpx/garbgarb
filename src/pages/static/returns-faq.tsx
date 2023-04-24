import Link from "next/link";
import { allowedCountries } from "../../utils/allowedCountries";
import { getCountryName } from "../../utils/isoCountryCodeToName";

const ReturnsAndFAQPage = () => {
    return (
        <div className="mx-auto mb-20 mt-10 flex w-full max-w-screen-md flex-1 flex-col gap-6 p-4 text-white">
            <h1 className="text-2xl font-semibold">Returns & FAQ</h1>
            <article id="countries" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">What countries do you ship to?</h2>
                <p className="text-sm">We ship to the following countries:</p>
                <div>
                    {allowedCountries.map((country, i) => (
                        <span className="text-sm" key={country}>
                            {getCountryName(country)}
                            {i !== allowedCountries.length - 1 && ", "}
                        </span>
                    ))}
                </div>
            </article>
            <article id="fees" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">
                    Will I have to pay any additional fees on my order?
                </h2>
                <p className="text-sm">
                    Please be aware that international orders may be subject to import taxes,
                    duties, and other customs charges that are specific to your country.
                    Unfortunately, we are unable to calculate these fees in advance, as they vary
                    based on location.
                </p>
                <p className="text-sm">
                    To learn more about your country's customs policies, we recommend contacting
                    your local customs office directly.
                </p>
                <p className="text-sm">
                    Please note that if your package incurs any customs charges, you are responsible
                    for paying them. Thank you for your understanding.
                </p>
            </article>
            <article id="cancel" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Cancellations</h2>
                <p className="text-sm">
                    All of our products are made to order per customer basis. If you wish to cancel
                    or amend your order, please use the link provided in your confirmation email or
                    click the order on your{" "}
                    <Link href="/my_orders">
                        <strong>
                            <u>Profile page</u>
                        </strong>
                    </Link>{" "}
                    <span className="text-sm">(if you made the purchase after signing in)</span>.
                    You can cancel your order at any time before it goes to production.
                </p>
                <p className="text-sm">
                    Please note that once your order has entered the production phase, it cannot be
                    canceled. However, if you encounter any issues with your order after receiving
                    it, please contact our customer service team within 30 days of delivery to
                    address any quality concerns.
                </p>
                <p className="text-sm">
                    Depending on the situation, you may be eligible for a replacement or a
                    resolution. We will do everything possible to assist you.
                </p>
            </article>
            <article id="quality" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Quality Issues</h2>
                <p className="text-sm">
                    To ensure the quickest resolution, please send an email to{" "}
                    <strong>
                        <u>xcosmpolitan2@gmail.com</u>
                    </strong>{" "}
                    and attach a photograph that clearly displays the quality issue or damaged area
                    of the item.
                </p>
                <p className="text-sm">
                    For optimal results, please take the picture on a flat surface with the tag and
                    error prominently visible.
                </p>
                <p className="text-sm">
                    We will promptly review your request and provide you with the best possible
                    solution to the issue at hand.
                </p>
            </article>
            <article id="refunds" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Refund Policy</h2>

                <p className="text-sm">
                    When you initiate a refund, our payment processor Stripe will submit a refund
                    request to the bank or card issuer associated with the customer's order.
                </p>
                <p className="text-sm">
                    Please keep in mind that it may take 5-10 business days you to see the refund
                    appear on your account, depending on the policies and processing times of your
                    specific bank or card issuer.
                </p>
                <p className="text-sm">
                    We strive to process refunds as quickly as possible, but we also ask for your
                    patience during this process. If your customer has not received the refund after
                    10 business days, we recommend reaching out to their bank or card issuer
                    directly to inquire about the status of the refund.
                </p>
            </article>
            <article id="payment-methods" className="flex flex-col items-start gap-2">
                <h2 className="font-semibold underline">Accepted Payment Methods</h2>
                <p className="text-sm">
                    We accept payments via credit cards, debit cards and Google Pay.
                </p>
            </article>
        </div>
    );
};

export default ReturnsAndFAQPage;
