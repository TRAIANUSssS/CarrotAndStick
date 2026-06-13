import React from "react";
import { useNavigate } from "react-router-dom";

import type { TaskDetail, TaskRead } from "../api/tasks";
import { tasksApi } from "../api/tasks";
import { ApiError } from "../api/client";
import { AppScaffold } from "../components/AppScaffold";
import { Modal } from "../components/Modal";
import { StatusIcon } from "../components/StatusIcon";
import { useAuth } from "../features/auth/AuthContext";
import { formatTimestamp } from "../lib/format";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && typeof error.detail === "object" && error.detail !== null) {
    const detail = "detail" in error.detail ? error.detail.detail : undefined;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

export function ArchivedTasksPage() {
  const navigate = useNavigate();
  const { dictionary, language, settings } = useAuth();
  const [tasks, setTasks] = React.useState<TaskRead[]>([]);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const iconPack = settings?.icon_pack ?? "cookie_whip";

  const loadArchivedTasks = React.useCallback(() => {
    setIsLoading(true);
    setErrorText(null);
    tasksApi
      .archived()
      .then((response) => setTasks(response))
      .catch((error: unknown) => setErrorText(getErrorMessage(error, dictionary.common.genericError)))
      .finally(() => setIsLoading(false));
  }, [dictionary.common.genericError]);

  React.useEffect(() => {
    loadArchivedTasks();
  }, [loadArchivedTasks]);

  React.useEffect(() => {
    if (selectedTaskId === null) {
      setSelectedTask(null);
      return;
    }

    setIsLoadingDetails(true);
    setErrorText(null);
    tasksApi
      .details(selectedTaskId)
      .then((response) => setSelectedTask(response))
      .catch((error: unknown) => setErrorText(getErrorMessage(error, dictionary.common.genericError)))
      .finally(() => setIsLoadingDetails(false));
  }, [dictionary.common.genericError, selectedTaskId]);

  const handleRestore = async (taskId: string) => {
    setIsSubmitting(true);
    setErrorText(null);
    try {
      await tasksApi.restore(taskId);
      setSelectedTaskId(null);
      setSelectedTask(null);
      loadArchivedTasks();
    } catch (error) {
      setErrorText(getErrorMessage(error, dictionary.common.genericError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScaffold>
      <section className="app-page tasks-page">
        <section className="section-block">
          <header className="section-block__header">
            <div>
              <p className="eyebrow">{dictionary.archivedPage.eyebrow}</p>
              <h1 className="page-title">{dictionary.archivedPage.title}</h1>
            </div>
            <button className="secondary-button" onClick={() => navigate("/app/tasks")} type="button">
              {dictionary.common.back}
            </button>
          </header>

          <div className="sr-only" aria-live="polite">
            {isLoading || isLoadingDetails ? dictionary.common.loading : ""}
          </div>
          {errorText ? <p className="form-error" role="alert">{errorText}</p> : null}
          {isLoading ? <div className="panel-state">{dictionary.common.loading}</div> : null}
          {!isLoading && tasks.length === 0 ? (
            <div className="panel-state panel-state--empty">{dictionary.archivedPage.empty}</div>
          ) : null}
          {!isLoading && tasks.length > 0 ? (
            <div className="archive-list">
              {tasks.map((task) => (
                <div key={task.id} className="archive-row">
                  <div>
                    <button className="archive-row__open" onClick={() => setSelectedTaskId(task.id)} type="button">
                      <strong>{task.name}</strong>
                    </button>
                    {task.archived_at ? <span>{formatTimestamp(language, task.archived_at)}</span> : null}
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => void handleRestore(task.id)}
                    type="button"
                  >
                    {dictionary.common.restore}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </section>

      {selectedTaskId !== null ? (
        <Modal title={selectedTask?.name ?? dictionary.common.loading} closeLabel={dictionary.common.close} onClose={() => setSelectedTaskId(null)}>
          {isLoadingDetails || selectedTask === null ? (
            <div className="modal-state">{dictionary.common.loading}</div>
          ) : (
            <div className="modal-stack">
              <dl className="detail-grid">
                <div>
                  <dt>{dictionary.tasksPage.createdAt}</dt>
                  <dd>{formatTimestamp(language, selectedTask.created_at)}</dd>
                </div>
              </dl>

              <dl className="detail-grid detail-grid--totals">
                <div className="detail-grid__card detail-grid__card--reward">
                  <dt>
                    <StatusIcon iconPack={iconPack} status="reward" label={dictionary.tasksPage.rewardShort} />
                    <span>{dictionary.tasksPage.rewardShort}</span>
                  </dt>
                  <dd>{selectedTask.total_reward}</dd>
                </div>
                <div className="detail-grid__card detail-grid__card--punishment">
                  <dt>
                    <StatusIcon iconPack={iconPack} status="punishment" label={dictionary.tasksPage.punishmentShort} />
                    <span>{dictionary.tasksPage.punishmentShort}</span>
                  </dt>
                  <dd>{selectedTask.total_punishment}</dd>
                </div>
              </dl>

              <div className="stack-actions">
                <button
                  className="primary-button"
                  disabled={isSubmitting}
                  onClick={() => void handleRestore(selectedTask.id)}
                  type="button"
                >
                  {dictionary.common.restore}
                </button>
                <button className="ghost-button" onClick={() => setSelectedTaskId(null)} type="button">
                  {dictionary.common.close}
                </button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}
    </AppScaffold>
  );
}
