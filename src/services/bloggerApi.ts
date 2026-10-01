import { BloggerBlog } from '../types/affiliate';

const BLOGGER_API_BASE = 'https://www.googleapis.com/blogger/v3';

/**
 * Fetch blogs owned by the authenticated Google user.
 */
export async function fetchUserBlogs(accessToken: string): Promise<BloggerBlog[]> {
  try {
    const res = await fetch(`${BLOGGER_API_BASE}/users/self/blogs`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData?.error?.message || `Gagal mengambil daftar blog (HTTP ${res.status})`;
      throw new Error(message);
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      postsCount: item.posts?.totalItems || 0,
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Koneksi ke Google Blogger API bermasalah.');
  }
}

export interface SaveDraftResponse {
  success: boolean;
  postId?: string;
  url?: string;
  title?: string;
  message: string;
}

/**
 * MANDATORY: Save post as DRAFT ONLY.
 * Strict rule: isDraft=true query param is ALWAYS appended.
 * Never publish directly.
 */
export async function saveArticleAsDraft(
  accessToken: string,
  blogId: string,
  title: string,
  htmlContent: string,
  labels: string[] = []
): Promise<SaveDraftResponse> {
  if (!accessToken) {
    throw new Error('Akses token Google Blogger tidak ditemukan. Silakan hubungkan Blogger terlebih dahulu.');
  }

  if (!blogId) {
    throw new Error('Silakan pilih blog tujuan di Eva Shop sebelum menyimpan draft.');
  }

  try {
    // Note: isDraft=true is strictly enforced in query params
    const endpoint = `${BLOGGER_API_BASE}/blogs/${blogId}/posts?isDraft=true`;
    
    const payload = {
      kind: 'blogger#post',
      title: title.trim(),
      content: htmlContent,
      labels: labels.filter(Boolean),
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detail = errorData?.error?.message || `Error status ${res.status}`;
      throw new Error(`Gagal menyimpan Draft: ${detail}`);
    }

    const createdPost = await res.json();
    return {
      success: true,
      postId: createdPost.id,
      url: createdPost.url,
      title: createdPost.title,
      message: '✅ Artikel berhasil disimpan sebagai Draft di Blogger.',
    };
  } catch (err: any) {
    throw new Error(err.message || 'Gagal menyimpan Draft ke Blogger.');
  }
}
