import { useRouter } from "next/router";
import { useEffect } from "react";
import { useVerifyLoginQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const [{ data, fetching }] = useVerifyLoginQuery();
    const router = useRouter();

    useEffect(() => {
        if (!fetching && !data?.verifyLogin) {
            router.replace('/login?next=' + router.pathname);
        }
    }, [fetching, data, router]);
}