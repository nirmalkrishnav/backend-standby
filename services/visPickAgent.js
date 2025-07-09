import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

// Global instances to reuse
let projectClient = null;
let EventPickAgent = null;

async function initializeEventPickAgent() {
    if (!projectClient) {
        projectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!EventPickAgent) {
        EventPickAgent = await projectClient.agents.getAgent("asst_SF8ZBAyhDyKJZYxNi8u0ikNm");
        console.log(`EventPick Agent retrieved: ${EventPickAgent.name}`);
    }


}

async function runEventPickAgentConversation(storeId) {
    try {
        // Initialize EventPick agent components if not already done
        await initializeEventPickAgent();

        const messageContent = `EventPicks for Store ID ${storeId} in Arkansas State`;
        const thread = await projectClient.agents.threads.create();
        const message = await projectClient.agents.messages.create(thread.id, "user", messageContent);
        // Create run
        let run = await projectClient.agents.runs.create(thread.id, EventPickAgent.id);

        // Poll until the run reaches a terminal status
        while (run.status === "queued" || run.status === "in_progress") {
            // Wait for a second
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await projectClient.agents.runs.get(thread.id, run.id);
        }

        if (run.status === "failed") {
            console.error(`Run failed: `, run.lastError);
            return {
                success: false,
                error: "EventPick Agent run failed",
                details: run.lastError
            };
        }

        // Retrieve messages
        const messages = await projectClient.agents.messages.list(thread.id, { order: "asc" });
        const conversationMessages = [];

        // Process messages
        for await (const m of messages) {
            const content = m.content.find((c) => c.type === "text" && "text" in c);
            if (content) {
                conversationMessages.push({
                    role: m.role,
                    content: content.text.value,
                    timestamp: m.created_at
                });
            }
        }

        return {
            success: true,
            threadId: thread.id,
            agentName: EventPickAgent.name,
            storeId: storeId,
            messages: conversationMessages,
            runStatus: run.status
        };
    } catch (error) {
        console.error('Error in runEventPickAgentConversation:', error);
        return {
            success: false,
            error: "EventPick Agent conversation failed",
            details: error.message
        };
    }
}

// Optional: Function to reset the thread if needed
async function resetThread() {
    try {
        if (projectClient && thread) {
            thread = await projectClient.agents.threads.create();
            console.log(`New thread created, ID: ${thread.id}`);
            return thread.id;
        }
        return null;
    } catch (error) {
        console.error('Error resetting thread:', error);
        throw error;
    }
}

export default runEventPickAgentConversation;
export { resetThread };
