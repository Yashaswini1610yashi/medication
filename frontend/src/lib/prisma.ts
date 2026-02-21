const globalForPrisma = globalThis as unknown as {
    prisma: any;
};

export const getPrisma = async () => {
    if (!globalForPrisma.prisma) {
        // Dynamic import to avoid top-level binary load crash in Turbopack
        const { PrismaClient } = await import("@prisma/client");
        globalForPrisma.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
                },
            },
            log: ["error"],
        });
    }
    return globalForPrisma.prisma;
};
