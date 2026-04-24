"use server"

// import {nodeCatalog} from "@neuron/nodes";

export async function getAvailableNodes() {
    try {
        // You could filter or sort here based on user permissions
        return {
            success: true,
            data: [],
        };
    } catch (error) {
        return { success: false, error: "Failed to load nodes" };
    }
}