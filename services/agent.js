import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

// Global instances to reuse
let projectClient = null;
let agent = null;

async function initializeAgent() {
    if (!projectClient) {
        projectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!agent) {
        agent = await projectClient.agents.getAgent("asst_SF8ZBAyhDyKJZYxNi8u0ikNm");
        console.log(`Agent retrieved: ${agent.name}`);
    }


}

async function runAgentConversation(storeId) {
    try {
        // Initialize agent components if not already done
        await initializeAgent();

        const messageContent = `EventPicks for Store ID ${storeId} in Arkansas State`;
        const thread = await projectClient.agents.threads.create();
        const message = await projectClient.agents.messages.create(thread.id, "user", messageContent);
        // Create run
        let run = await projectClient.agents.runs.create(thread.id, agent.id);

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
                error: "Agent run failed",
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
            agentName: agent.name,
            storeId: storeId,
            messages: conversationMessages,
            runStatus: run.status
        };
    } catch (error) {
        console.error('Error in runAgentConversation:', error);
        return {
            success: false,
            error: "Agent conversation failed",
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

export default runAgentConversation;
export { resetThread };
