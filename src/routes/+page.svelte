<script lang="ts">
	import { inview } from 'svelte-inview';
	import { cacheExchange, createClient, fetchExchange, gql, queryStore } from '@urql/svelte';
	import Loader from 'components/Loader.svelte';
	import User from 'components/User.svelte';
	import type { UserType } from 'lib/types';
	import { to_number } from 'svelte/internal';

	const client = createClient({
		url: '/graphql',
		exchanges: [cacheExchange, fetchExchange]
	});

	let startIndex = 0;
	let loadLimit = 10;
	let endIndex = loadLimit;
	let loadedUsers: any[] = [];
	const inviewOptions = {};

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	$: result = queryStore<{ users: UserType[] }>({
		client,
		query: gql`
			query {
				users(start: ${startIndex.toString()}, limit: ${loadLimit.toString()}) {
					id
					name
					avatar
					email
				}
			}
		`
	});

	$: if ($result.data) {
		loadedUsers = [...loadedUsers, ...$result.data.users];
	}
</script>

<div class="w-full h-full overflow-scroll">
	<div class="flex flex-col gap-4 items-center p-4">
		{#each loadedUsers as user (user.id)}
			{#if parseInt(user.id) != endIndex}
				<User {user} />
			{:else}
				<div
					use:inview={inviewOptions}
					on:inview_enter={(event) => {
						startIndex = startIndex + loadLimit;
						endIndex = endIndex + loadLimit;
					}}
				>
					<User {user} />
				</div>
			{/if}
		{/each}
		{#if $result.fetching}
			<Loader />
		{/if}
	</div>
</div>
