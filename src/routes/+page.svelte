<script lang="ts">
	import { inview } from 'svelte-inview';
	import { cacheExchange, createClient, fetchExchange, gql, queryStore } from '@urql/svelte';
	import Loader from 'components/Loader.svelte';
	import User from 'components/User.svelte';
	import type { UserType } from 'lib/types';

	const client = createClient({
		url: '/graphql',
		exchanges: [cacheExchange, fetchExchange]
	});

	let startIndex = 0;
	let loadLimit = 10;
	let endIndex = loadLimit;
	let loadedUsers: any[] = [];
	const inviewOptions = {};
	let totalCount = 0;

	function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	$: result = queryStore<{
		totalUserCount: number;
		users: UserType[];
	}>({
		client,
		query: gql`
			query {
				users(start: ${startIndex.toString()}, limit: ${loadLimit.toString()}) {
					id
					name
					avatar
					email
				}
				totalUserCount
			}
		`
	});

	$: if ($result.data) {
		totalCount = $result.data.totalUserCount;
		loadedUsers = [...loadedUsers, ...$result.data.users];
	}
</script>

<div class="w-full h-full overflow-scroll">
	<div class="flex flex-col gap-4 items-center p-4">
		{#each loadedUsers as user (user.id)}
			{#if parseInt(user.id) != endIndex || endIndex == totalCount}
				<User {user} />
			{:else}
				<div
					use:inview={inviewOptions}
					on:inview_enter={(event) => {
						startIndex = startIndex + loadLimit;
						endIndex = endIndex + loadLimit;
						console.log(`Requesting ${startIndex} to ${endIndex}`);
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
