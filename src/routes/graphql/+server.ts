import { createYoga, createSchema } from 'graphql-yoga';
import { useGraphQlJit } from '@envelop/graphql-jit';

import type { RequestEvent } from '@sveltejs/kit';

import { users } from '$lib/data';

import schema from '$lib/schema.gql';

const yogaApp = createYoga<RequestEvent>({
	schema: createSchema({
		typeDefs: schema,
		resolvers: {
			Query: {
				users: async (source, {start, limit}, context, info) => {
					await new Promise((fulfil) => setTimeout(fulfil, 1000 * Math.floor(Math.random()*1 + 1)))
					return users.slice(start, start + limit);
				},
				totalUserCount: async () => {
					return users.length
				}
			}
		}
	}),
	plugins: [useGraphQlJit()],
	fetchAPI: globalThis
});

export { yogaApp as GET, yogaApp as POST };
