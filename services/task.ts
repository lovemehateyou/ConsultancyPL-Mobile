


import { apiRequest } from './api';

export type GoalTaskMapLink = {
	url: string;
	city?: string | null;
	subCity?: string | null;
};

export type GoalTask = {
	id: number;
	goalId: number;
	title: string;
	description?: string | null;
	stepOrder: number;
	mapLinks?: GoalTaskMapLink[] | null;
	createdAt?: string;
	updatedAt?: string;
};

export type Goal = {
	id: number;
	title: string;
	description?: string | null;
	category: string;
	businessArea?: string | null;
	businessType?: string | null;
	Tasks?: GoalTask[];
	createdAt?: string;
	updatedAt?: string;
};

export type UserTaskProgress = {
	id: number;
	userGoalId: number;
	taskId: number;
	isCompleted: boolean;
	completedAt?: string | null;
	Task?: GoalTask;
};

export type UserGoal = {
	id: number;
	userId?: string;
	goalId: number;
	progress: number;
	status: string;
	Goal?: Goal;
	UserTaskProgresses?: UserTaskProgress[];
	UserTaskProgress?: UserTaskProgress[];
	createdAt?: string;
	updatedAt?: string;
};

type TaskActionPayload = {
	userGoalId: number;
	taskId: number;
};

type TaskActionResponse = {
	message: string;
	result?: unknown;
};

export const fetchMyGoals = async () => {
	return apiRequest<UserGoal[]>('/goals/my-goals');
};

export const assignMatchingGoals = async () => {
	return apiRequest<{ message: string; data: UserGoal[] }>('/goals/assign-my-goals', {
		method: 'POST',
	});
};

export const completeGoalTask = async (payload: TaskActionPayload) => {
	return apiRequest<TaskActionResponse>('/goals/complete-task', {
		method: 'POST',
		body: payload,
	});
};

export const undoGoalTask = async (payload: TaskActionPayload) => {
	return apiRequest<TaskActionResponse>('/goals/undo-task', {
		method: 'POST',
		body: payload,
	});
};



