FROM oven/bun:1.2

# git + openssh needed at runtime — app calls `git pull` in the vault dir
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY src/ ./src/

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
