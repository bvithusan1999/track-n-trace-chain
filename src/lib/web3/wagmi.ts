import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

// ✅ Define your local Ganache chain
export const ganache = defineChain({
    id: 1337,
    name: "Ganache Local",
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["http://127.0.0.1:7545"], // 👈 Ganache RPC URL
        },
    },
});

// ✅ Create wagmi config for your local blockchain
export const wagmiConfig = createConfig({
    chains: [ganache],
    connectors: [
        injected({
            shimDisconnect: true, // keeps MetaMask session consistent
        }),
    ],
    transports: {
        [ganache.id]: http("http://127.0.0.1:7545"),
    },
});
