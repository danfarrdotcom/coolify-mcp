import { z } from "zod";
import type { ZodRawShape, ZodTypeAny } from "zod";

type ToolHandler<Args extends ZodRawShape> = (
	args: z.infer<z.ZodObject<Args>>,
	extra: unknown,
) => Promise<unknown> | unknown;

type PromptArgs = Record<string, ZodTypeAny>;

type PromptHandler<Args extends PromptArgs> = (
	args: z.infer<z.ZodObject<Args>>,
	extra: unknown,
) => Promise<unknown> | unknown;

export interface McpServerLike {
	tool<Args extends ZodRawShape>(
		name: string,
		description: string,
		paramsSchema: Args,
		handler: ToolHandler<Args>,
	): unknown;

	resource(
		name: string,
		uri: string,
		metadata: Record<string, unknown>,
		handler: (uri?: URL, extra?: unknown) => Promise<unknown> | unknown,
	): unknown;

	prompt<Args extends PromptArgs>(
		name: string,
		description: string,
		argsSchema: Args,
		handler: PromptHandler<Args>,
	): unknown;
}
