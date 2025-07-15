import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

// Global instances to reuse
let eventProjectClient = null;
let eventPickAgent = null;
let vizProjectClient = null;
let vizPickAgent = null;
let chatbotProjectClient = null;
let chatbotAgent = null;


async function initializeVizPickAgent() {
    if (!vizProjectClient) {
        vizProjectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!vizPickAgent) {
        vizPickAgent = await vizProjectClient.agents.getAgent("asst_BzNlNOKe6wNabqag187a3Rma");
        console.log(`VizPick Agent retrieved: ${vizPickAgent.name}`);
    }
}

async function initializeDigitalPickAgent() {
    if (!eventProjectClient) {
        eventProjectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!eventPickAgent) {
        eventPickAgent = await eventProjectClient.agents.getAgent("asst_g5G63l03x5b4AmeqNX3tmR7b");
        console.log(`EventPick Agent retrieved: ${eventPickAgent.name}`);
    }
}

async function initializeHomePageAgent() {
    if (!eventProjectClient) {
        eventProjectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!eventPickAgent) {
        eventPickAgent = await eventProjectClient.agents.getAgent("asst_J4qbTb90hXB1xoxHq5CyG2rt");
        console.log(`EventPick Agent retrieved: ${eventPickAgent.name}`);
    }
}

async function initializeEventPickAgent() {
    if (!eventProjectClient) {
        eventProjectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Project client initialized');
    }

    if (!eventPickAgent) {
        eventPickAgent = await eventProjectClient.agents.getAgent("asst_SF8ZBAyhDyKJZYxNi8u0ikNm");
        console.log(`EventPick Agent retrieved: ${eventPickAgent.name}`);
    }
}

async function initializeChatbotAgent() {
    if (!chatbotProjectClient) {
        chatbotProjectClient = new AIProjectClient(
            "https://wmt-fashion-agent-resource.services.ai.azure.com/api/projects/wmt-fashion-agent",
            new DefaultAzureCredential()
        );
        console.log('Chatbot project client initialized');
    }

    if (!chatbotAgent) {
        // You'll need to replace this with your actual chatbot agent ID
        chatbotAgent = await chatbotProjectClient.agents.getAgent("asst_Z94SM4Rk60GhcycV5qQ3Dh4y");
        console.log(`Chatbot Agent retrieved: ${chatbotAgent.name}`);
    }
}


async function runAgent(storeId, agentName) {
    try {
        let projectClient = null;
        let agent = null;
        // Initialize EventPick agent components if not already done
        if (agentName === "viz-pick") {
            await initializeVizPickAgent();
            projectClient = vizProjectClient;
            agent = vizPickAgent
        } else if (agentName === "event-pick") {
            await initializeEventPickAgent();
            projectClient = eventProjectClient;
            agent = eventPickAgent;
        } else if (agentName === "digital-pick") {
            await initializeDigitalPickAgent();
            projectClient = eventProjectClient;
            agent = eventPickAgent;
        } else if (agentName === "home-page") {
            await initializeHomePageAgent();
            projectClient = eventProjectClient;
            agent = eventPickAgent;
        } else {
            return;
        }

        const messageContent = `${storeId}`;
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
            agentName: agent.name,
            storeId: storeId,
            messages: conversationMessages,
            runStatus: run.status
        };
    } catch (error) {
        console.error('Error in agent:', error);
        return {
            success: false,
            error: "EventPick Agent conversation failed",
            details: error.message
        };
    }
}

// New runChatbot function
async function runChatbot(message) {
    try {
        // Initialize Chatbot agent components if not already done
        await initializeChatbotAgent();

        // Create thread and send message
        const thread = await chatbotProjectClient.agents.threads.create();
        const userMessage = await chatbotProjectClient.agents.messages.create(thread.id, "user", message);

        // Create run
        let run = await chatbotProjectClient.agents.runs.create(thread.id, chatbotAgent.id);

        // Poll until the run reaches a terminal status
        while (run.status === "queued" || run.status === "in_progress") {
            // Wait for a second
            await new Promise((resolve) => setTimeout(resolve, 1000));
            run = await chatbotProjectClient.agents.runs.get(thread.id, run.id);
        }

        if (run.status === "failed") {
            console.error(`Chatbot run failed: `, run.lastError);
            return {
                success: false,
                error: "Chatbot Agent run failed",
                details: run.lastError
            };
        }

        // Retrieve messages
        const messages = await chatbotProjectClient.agents.messages.list(thread.id, { order: "asc" });
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
            agentName: chatbotAgent.name,
            userMessage: message,
            messages: conversationMessages,
            runStatus: run.status
        };
    } catch (error) {
        console.error('Error in chatbot agent:', error);
        return {
            success: false,
            error: "Chatbot Agent conversation failed",
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

export default runAgent;
export { resetThread, runChatbot };
