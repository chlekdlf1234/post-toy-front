import { dedupExchange, fetchExchange, stringifyVariables } from "urql";
import { LoginMutation, VerifyLoginQuery, VerifyLoginDocument, RegisterMutation, LogoutMutation, VoteMutationVariables, PostsQuery, DeletePostMutationVariables } from "../generated/graphql";
import { toUpdateQuery } from "./toUpdateQuery";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";

import { pipe, tap } from "wonka";
import { Exchange } from 'urql';
import Router from "next/router";

import gql from 'graphql-tag'
import { isServer } from "./isServer";

const cursorPagination = (
): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        const allFields = cache.inspectFields(entityKey);

        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isInCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey) as string, "posts")

        info.partial = !isInCache;

        let hasMore:boolean = true;
        const results: string[] = [];
        
        fieldInfos.forEach(fi => {
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, 'posts') as string[];
            const _hasMore = cache.resolve(key, 'hasMore');

            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }

            results.push(...data);
        })
        
        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results
        }
    };
};

export const errorExchange: Exchange = ({ forward }) => ops$ => {

    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes("Not Authenticated")) {
                Router.replace("/login");
            }
        })
    )
}

const invalidateAllPosts = (cache: Cache) => {

    const allFields = cache.inspectFields('Query');

    const fieldInfos = allFields.filter(info => info.fieldName === 'posts');

    fieldInfos.forEach((fi) => {
        cache.invalidate('Query', 'posts', fi.arguments || {})
    })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = ''

    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }
    return {
        url: process.env.NEXT_PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? {
                cookie
            } : undefined
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                  PaginatedPosts: ()=> null  
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    }
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, info) => {
                            cache.invalidate({__typename: 'Post', id: (args as DeletePostMutationVariables).id})
                        },
                        vote: (_result, args, cache, info) => { 
                            const { postId, value } = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                    fragment _ on Post{
                                        id
                                        points
                                        voteStatus
                                    }
                                `,
                                { id: postId } as any
                            );

                            if (data) {
                                if (data.voteStatus === value) {
                                    return;
                                }
                                const newPoints = (data.points as number) + ((!data.voteStatus ? 1: 2) * value); 
                                cache.writeFragment(
                                    gql`
                                        fragment _ on Post{
                                            points
                                            voteStatus
                                        }
                                    `,
                                    {id: postId, points: newPoints, voteStatus: value} as any
                                )
                            }
                        },
                        createPost: (_result, args, cache, info) => { 
                            invalidateAllPosts(cache);
                        },
                        login: (_result, args, cache, info) => {
                            //TODO login 후 post cache 처리
                            toUpdateQuery<LoginMutation, VerifyLoginQuery>(
                                cache,
                                {
                                    query: VerifyLoginDocument,
                                },
                                _result,
                                (result, query) => {
                                    if (result.login.errors) {
                                        return query;
                                    } else {
                                        return {
                                            verifyLogin: result.login.user,
                                        };
                                    }
                                }
                            );
                            invalidateAllPosts(cache);
                        },
                        register: (_result, args, cache, info) => {
                            toUpdateQuery<RegisterMutation, VerifyLoginQuery>(
                                cache,
                                {
                                    query: VerifyLoginDocument,
                                },
                                _result,
                                (result, query) => {
                                    if (result.register.errors) {
                                        return query;
                                    } else {
                                        return {
                                            verifyLogin: result.register.user,
                                        };
                                    }
                                }
                            );
                        },
                        logout: (_result, args, cache, info) => {
                            toUpdateQuery<LogoutMutation, VerifyLoginQuery>(
                                cache,
                                { query: VerifyLoginDocument },
                                _result,
                                () => {
                                    return { verifyLogin: null };
                                }
                            );
                        },
                    },
                },
            }),
            errorExchange,
            ssrExchange,
            fetchExchange,
        ],
    }
}