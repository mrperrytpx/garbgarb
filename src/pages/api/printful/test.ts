import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const session_id = req.query;

        console.log(session_id);

        return res.status(200).json({ session_id });
    }
}
