import { InterviewClient } from "./interview-client";

export default function InterviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // params is now a Promise in Next.js 15, but we pass it through
  // The client component reads session data from sessionStorage
  return <InterviewClientWrapper params={params} />;
}

async function InterviewClientWrapper({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <InterviewClient sessionId={sessionId} />;
}
