import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Edit3,
  Trash2,
  HelpCircle,
  Home,
  IdCard,
  LogOut,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Button from "../components/Button";
import { avatars } from "../data/avatars";
import {
  askAi,
  clearAuthToken,
  clearAuthUser,
  getAuthUser,
  createResource,
  deleteResource,
  getUserResources,
  updateResource,
  type ResourceDto,
} from "../api/apiClient";

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Study Room", icon: BookOpen, path: "/library", active: true },
  { label: "Flashcards", icon: IdCard, path: "/flashcards" },
  { label: "Quizzes", icon: HelpCircle, path: "/quizzes" },
];

function LibraryPage() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const displayName =
    authUser?.displayName?.trim() ||
    authUser?.displayName ||
    "User";
  const displayLabel = (() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1][0]?.toUpperCase()}.`;
    }
    return displayName;
  })();
  const avatarSrc = authUser?.avatarId
    ? avatars.find((avatar) => avatar.id === authUser.avatarId)?.src
    : null;
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [activeTag, setActiveTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newText, setNewText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceDto | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResources() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserResources();
        if (cancelled) return;
        setResources(data);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unable to load resources."
        );
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    loadResources();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    setIsCopied(false);
  }, [aiResponse]);

  const tags = useMemo(() => {
    const unique = new Set<string>();
    resources.forEach((resource) => {
      resource.tags.forEach((tag) => unique.add(tag));
    });
    return ["All", ...Array.from(unique)];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesTag =
        activeTag === "All" || resource.tags.some((tag) => tag === activeTag);
      const matchesSearch =
        term.length === 0 ||
        resource.title.toLowerCase().includes(term) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchesTag && matchesSearch;
    });
  }, [resources, activeTag, searchTerm]);

  const handleAddTag = () => {
    const cleaned = newTagInput.trim();
    if (!cleaned) return;
    if (newTags.includes(cleaned)) return;
    setNewTags((prev) => [...prev, cleaned]);
    setNewTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setNewTitle("");
    setNewTags([]);
    setNewTagInput("");
    setNewText("");
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (resource: ResourceDto) => {
    setEditingId(resource._id);
    setNewTitle(resource.title);
    setNewTags(resource.tags);
    setNewTagInput("");
    setNewText(resource.textContent);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSaveResource = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      if (!newTitle.trim()) {
        setSaveError("Resource title is required.");
        return;
      }

      if (editingId) {
        await updateResource(editingId, {
          title: newTitle.trim(),
          tags: newTags,
          textContent: newText.trim(),
        });
      } else {
        if (!newText.trim()) {
          setSaveError("Paste some text before saving.");
          return;
        }

        await createResource({
          title: newTitle.trim(),
          textContent: newText.trim(),
          tags: newTags,
        });
      }

      const refreshed = await getUserResources();
      setResources(refreshed);
      setIsModalOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save resource.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource(deleteTarget._id);
      const refreshed = await getUserResources();
      setResources(refreshed);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete resource.");
      setDeleteTarget(null);
    }
  };

  const handleAskAi = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt || isAiLoading) return;

    try {
      setIsAiLoading(true);
      setAiError(null);
      const response = await askAi(prompt);
      setAiResponse(response);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unable to reach AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    if (!aiResponse) return;
    try {
      await navigator.clipboard.writeText(aiResponse);
      setIsCopied(true);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch {
      setIsCopied(false);
    }
  };

  const handleSaveAiAsResource = () => {
  if (!aiResponse.trim()) return;

  setEditingId(null);       
  setNewTitle(aiPrompt.trim());        
  setNewTags([]);           
  setNewTagInput("");
  setNewText(aiResponse);   
  setSaveError(null);
  setIsModalOpen(true);     
};


  const handleLogout = () => {
    clearAuthToken();
    clearAuthUser();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <header className="bg-[var(--color-primary)] text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-sm bg-[var(--color-accent)] shadow-[0_10px_24px_rgba(0,0,0,0.2)]" />
            <div className="leading-tight">
              <div className="text-lg font-extrabold uppercase tracking-wide">
                Logotype
              </div>
              <div className="text-[11px] text-white/80">Brand Descriptor</div>
            </div>
          </div>

          <div className="flex min-w-[240px] flex-1 items-center justify-center">
            <label className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-full border border-white/20 bg-white/15 px-11 py-3 text-sm text-white placeholder:text-white/70 focus:border-white/50 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15 text-base font-semibold">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </span>
              <div className="font-semibold">{displayLabel}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
            >
              Logout
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 py-4 text-sm font-semibold text-slate-600">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition ${
                  item.active
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-strong)]"
                    : "hover:text-[var(--color-primary-strong)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="px-6 pb-14 pt-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <section>
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <h1 className="text-4xl font-black tracking-tight">My Library</h1>
              <Button className="rounded-full px-6" onClick={openCreateModal}>
                Upload Resource
              </Button>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                    activeTag === tag
                      ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-strong)]"
                      : "bg-[var(--color-primary-muted)] text-[var(--color-primary-strong)] hover:bg-[var(--color-primary-hover)] hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : isLoading ? (
              <div className="text-sm text-gray-500">Loading resources...</div>
            ) : filteredResources.length === 0 ? (
              <div className="rounded-2xl border border-white/50 bg-white/60 px-5 py-6 text-sm text-gray-600 shadow-[var(--shadow-card)]">
                No resources yet. Upload your first study resource to see it
                here.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                {filteredResources.map((resource) => {
                  const createdLabel = new Date(
                    resource.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={resource._id}
                      className="group rounded-2xl border border-white/40 bg-white/80 p-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to={`/resources/${resource._id}`}
                            className="text-lg font-bold text-[var(--color-primary-strong)] hover:underline"
                          >
                            {resource.title}
                          </Link>
                          {resource.tags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-primary-strong)]">
                              {resource.tags.map((tag) => (
                                <span
                                  key={`${resource._id}-${tag}`}
                                  className="rounded-full bg-[var(--color-primary-muted)] px-3 py-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(resource)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            aria-label="Edit resource"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(resource)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            aria-label="Delete resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-5 text-xs text-gray-500">
                        Created {createdLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="relative">
            <div className="mb-6 flex items-center gap-3">
              <Star className="h-7 w-7 text-[var(--color-primary-strong)]" />
              <h2 className="text-2xl font-black tracking-tight">
                AI Workspace
              </h2>
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/90 p-8 shadow-[var(--shadow-card)]">
              <div className="space-y-5 text-sm leading-relaxed text-slate-700">
                {aiError ? (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {aiError}
                  </p>
                ) : null}
             {aiResponse ? (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopyResponse}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-50"
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>

      <button
        type="button"
        onClick={handleSaveAiAsResource}
        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:bg-slate-50"
      >
        Save as resource
      </button>
    </div>

    <div className="max-h-96 overflow-y-auto pr-2">
      <p className="whitespace-pre-wrap">{aiResponse}</p>
    </div>
  </div>
) : null}

              </div>

              <div className="mt-10">
                <form
                  onSubmit={handleAskAi}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <input
                    type="text"
                    placeholder="Ask anything"
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md disabled:opacity-60"
                    aria-label="Send prompt"
                    disabled={!aiPrompt.trim() || isAiLoading}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-resource-title"
        >
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 id="upload-resource-title" className="text-2xl font-black">
                  {editingId ? "Edit Resource" : "Upload New Resource"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {editingId
                    ? "Update the resource details below."
                    : "Paste your text in the field below to create a new resource."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {saveError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <input
                type="text"
                placeholder="Resource Title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Add Tags"
                  value={newTagInput}
                  onChange={(event) => setNewTagInput(event.target.value)}
                  className="w-36 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-md"
                  aria-label="Add tag"
                >
                  +
                </button>
              </div>

              {newTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full bg-[var(--color-primary-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-strong)]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : null}

              <div>
                <textarea
                  placeholder="Paste your Text here"
                  value={newText}
                  onChange={(event) => setNewText(event.target.value)}
                  rows={7}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
                <div className="mt-2 text-xs text-gray-400">{newText.length}/10 000</div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="rounded-full px-6"
                  onClick={handleSaveResource}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  className="rounded-full px-6"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-resource-title"
        >
          <div className="w-full max-w-lg rounded-[28px] bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-6">
              <h2 id="delete-resource-title" className="text-2xl font-black">
                Are you sure you want to delete this resource?
              </h2>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-full px-6" onClick={handleConfirmDelete}>
                Yes, Delete
              </Button>
              <Button
                className="rounded-full px-6"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LibraryPage;
