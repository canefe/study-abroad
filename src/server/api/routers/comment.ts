import { z } from "zod";

import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const commentsRouter = createTRPCRouter({
	/*
        Get list of comments for an application
    */
	getList: protectedProcedure
		.input(z.object({ applicationId: z.number() }))
		.query(async ({ input, ctx }) => {
			const comments = await ctx.db.message.findMany({
				where: {
					applicationId: input.applicationId,
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
							role: true,
							guid: true,
							mutedBy: {
								select: {
									id: true,
								},
							},
						},
					},
					replies: {
						include: {
							sender: {
								select: {
									id: true,
									name: true,
									role: true,
									guid: true,
									mutedBy: {
										select: {
											id: true,
										},
									},
								},
							},
						},
					},
				},
			});
			return comments;
		}),
	/*
        Send a comment (Student)
    */
	sendComment: protectedProcedure
		.input(
			z.object({
				applicationId: z.number(),
				comment: z.string(),
				parentMessageId: z.number().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			// check if user is owner of application
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
					userId: session.user.id,
				},
			});

			if (!application) {
				return new Response("Forbidden", { status: 403 });
			}

			// update application status
			await ctx.db.application.update({
				where: {
					id: input.applicationId,
				},
				data: {
					messages: {
						create: {
							content: input.comment,
							senderId: session.user.id,
							parentId: input.parentMessageId,
						},
					},
				},
			});

			// return users participating in the application's conversations (always inlclude the application owner)
			const users = await ctx.db.message.findMany({
				where: {
					applicationId: input.applicationId,
				},
				select: {
					senderId: true,
					sender: {
						select: {
							mutedUsers: {
								select: {
									id: true,
								},
							},
						},
					},
				},
				distinct: ["senderId"],
			});

			const filteredUsers = users.filter(
				(user) =>
					user.senderId !== session.user.id &&
					!user.sender.mutedUsers.find((mu) => mu.id === session.user.id),
			);

			const otherUsersNotifications = filteredUsers.map((user) => ({
				userId: user.senderId,
				message: `NEW_MESSAGE_IN_APPLICATION_${input.applicationId}`,
				read: false,
				senderId: session.user.id,
			}));

			await ctx.db.notification.createMany({
				data: otherUsersNotifications,
			});

			return "Success";
		}),
	/*
        Send a comment (Admin)
    */
	feedback: adminProcedure
		.input(
			z.object({
				applicationId: z.number(),
				comment: z.string(),
				parentMessageId: z.number().nullable().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			const application = await ctx.db.application.findFirst({
				where: {
					id: input.applicationId,
				},
				select: {
					userId: true,
					user: {
						select: {
							mutedUsers: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			});

			if (!application) {
				return new Response("Forbidden", { status: 403 });
			}

			// update application status
			await ctx.db.application.update({
				where: {
					id: input.applicationId,
				},
				data: {
					messages: {
						create: {
							content: input.comment,
							senderId: session.user.id,
							parentId: input.parentMessageId,
						},
					},
				},
			});

			// return users participating in the application's conversations (always inlclude the application owner)
			const users = await ctx.db.message.findMany({
				where: {
					applicationId: input.applicationId,
				},
				select: {
					senderId: true,
					sender: {
						select: {
							mutedUsers: {
								select: {
									id: true,
								},
							},
						},
					},
				},
			});

			const owner = application.user;
			// if owner is on the list, remove it
			let filteredUsers = users.filter(
				(user) => user.senderId !== application.userId,
			);
			// if the one who commented is on the list, remove it
			filteredUsers = filteredUsers.filter(
				(user) => user.senderId !== session.user.id,
			);

			filteredUsers = filteredUsers.filter(
				(user) =>
					!user.sender.mutedUsers.find((mu) => mu.id === session.user.id),
			);

			// send two different notifications to owner and other users
			if (!owner.mutedUsers.find((mu) => mu.id === session.user.id)) {
				const ownerNotification = {
					userId: application.userId,
					message: `NEW_FEEDBACK_IN_APPLICATION_${input.applicationId}`,
					read: false,
					senderId: session.user.id,
				};
				await ctx.db.notification.create({
					data: ownerNotification,
				});
			}

			// admins
			const otherUsersNotifications = filteredUsers.map((user) => ({
				userId: user.senderId,
				message: `NEW_MESSAGE_IN_APPLICATION_${input.applicationId}`,
				read: false,
				senderId: session.user.id,
			}));

			await ctx.db.notification.createMany({
				data: otherUsersNotifications,
			});

			return "Success";
		}),
	/*
        Delete a comment
    */
	deleteComment: protectedProcedure
		.input(z.object({ messageId: z.number() }))
		.mutation(async ({ input, ctx }) => {
			const session = ctx.session;
			// check if user is owner of message
			const message = await ctx.db.message.findFirst({
				where: {
					id: input.messageId,
					senderId: session.user.id,
				},
			});

			if (!message) {
				return new Response("Forbidden", { status: 403 });
			}

			// delete replies
			await ctx.db.message.deleteMany({
				where: {
					parentId: input.messageId,
				},
			});

			// delete message
			await ctx.db.message.delete({
				where: {
					id: input.messageId,
				},
			});
			return "Success";
		}),
});
