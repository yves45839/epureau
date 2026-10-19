export const projectPath = (slug: string) => "/ingenierie/nos-realisations/" + encodeURIComponent(slug);
export const projectName = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
