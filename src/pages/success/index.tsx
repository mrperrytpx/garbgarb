import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { emptyCart } from "../../redux/slices/cartSlice";
import { useRouter } from "next/router";
import { AiOutlineCheck } from "react-icons/ai";

const SuccessPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { session_id } = router.query;

    useEffect(() => {
        if (session_id) {
            dispatch(emptyCart());
        }
    }, [session_id, dispatch]);

    return (
        <div className="m-auto flex-1 text-white">
            <div className="mb-16 flex flex-col items-center justify-center gap-4 p-2">
                <AnimatedCheckmark />
                <div className="text-center">
                    <h1 className="text-xl font-bold">Thank you for Your purchase!</h1>
                    <p className="mt-1 text-lg">We'll email you the receipt shortly!</p>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;

const AnimatedCheckmark = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-100 p-4">
            <AiOutlineCheck size="52" fill="white" />
            <div className="absolute top-0 left-0 h-1/2 w-1/2 translate-x-1/2 translate-y-1/2 rotate-180">
                <div
                    style={{
                        width: mounted ? "0%" : "100%",
                    }}
                    className="transition-width h-full bg-black duration-500"
                ></div>
            </div>
        </div>
    );
};
