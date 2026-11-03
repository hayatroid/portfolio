import type { Bindings } from "./index";

const user = "hayatroid";

export default async (_: unknown, env: Bindings) => {
  const [badge, ranks] = await Promise.all([
    fetch(`https://atcoder-badges.vercel.app/api/atcoder/json/${user}`).then(
      (res) => res.json(),
    ),
    fetch(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/language_rank?user=${user}`,
    ).then((res) => res.json()),
  ]);
  const counts = Object.fromEntries(
    ranks.map(({ language, count }: { language: string; count: number }) => [
      language,
      count,
    ]),
  );
  await env.ATCODER.put(
    user,
    JSON.stringify({ rating: badge.message, color: badge.color, counts }),
  );
};
