import os
import requests
import tkinter as tk
from tkinter import messagebox, filedialog
from tkinter.ttk import Progressbar

def download_arxiv_paper(paper_id, download_path, progress_var, progress_bar, status_label):
    # 构造 PDF 文件的 URL
    paper_id_cleaned = paper_id.replace('arXiv:', '').strip()  # 清理输入的 ID
    pdf_url = f"https://arxiv.org/pdf/{paper_id_cleaned}.pdf"

    try:
        response = requests.get(pdf_url, stream=True)

        # 检查请求是否成功
        if response.status_code == 200:
            total_size = int(response.headers.get('content-length', 0))
            block_size = 1024  # 每个下载块的大小
            
            # 创建下载文件的完整路径
            file_path = os.path.join(download_path, f"{paper_id_cleaned}.pdf")
            with open(file_path, 'wb') as file:
                # 初始化进度条
                progress_bar['maximum'] = total_size
                progress_bar['value'] = 0
                
                downloaded_size = 0
                for data in response.iter_content(block_size):
                    file.write(data)
                    downloaded_size += len(data)
                    progress_var.set(downloaded_size)
                    progress_bar.update()  # 更新进度条

                    # 更新状态标签
                    status_label.config(text=f"正在下载: {paper_id_cleaned} ({downloaded_size / (1024 * 1024):.2f} MB / {total_size / (1024 * 1024):.2f} MB)")
                
            return f"{paper_id_cleaned}.pdf 下载完成"
        else:
            return f"{paper_id_cleaned} 下载失败，状态码：{response.status_code}"

    except Exception as e:
        return f"{paper_id_cleaned} 发生错误：{e}"

def on_download():
    paper_ids = text_ids.get("1.0", tk.END).strip().splitlines()
    download_path = entry_path.get()
    
    if not paper_ids or all(not pid for pid in paper_ids):
        messagebox.showwarning("警告", "请输入至少一个 arXiv 论文的 ID。")
        return
    
    if not download_path:
        messagebox.showwarning("警告", "请选择下载路径。")
        return
    
    # 清空之前的进度
    progress_var.set(0)
    results = []
    
    # 更新进度条
    for paper_id in paper_ids:
        if paper_id:  # 确保 ID 不为空
            result = download_arxiv_paper(paper_id, download_path, progress_var, progress_bar, status_label)
            results.append(result)
    
    # 下载完成后，显示所有结果
    messagebox.showinfo("完成", "\n".join(results))

def select_download_path():
    path = filedialog.askdirectory()
    if path:
        entry_path.delete(0, tk.END)  # 清空输入框
        entry_path.insert(0, path)      # 设置选择的路径

def create_gui():
    # 创建主窗口
    root = tk.Tk()
    root.title("arXiv Downloader")
    
    # 创建标签
    label_id = tk.Label(root, text="请输入 arXiv 论文的 ID（每行一个，例如：arXiv:1234.56789）：")
    label_id.pack(pady=10)
    
    # 创建输入框
    global text_ids
    text_ids = tk.Text(root, width=50, height=10)  # 使用 Text 组件来支持多行输入
    text_ids.pack(pady=5)

    # 创建下载路径标签
    label_path = tk.Label(root, text="请选择下载路径：")
    label_path.pack(pady=10)

    # 创建下载路径输入框
    global entry_path
    entry_path = tk.Entry(root, width=40)
    entry_path.pack(pady=5)

    # 创建选择路径按钮
    path_button = tk.Button(root, text="选择路径", command=select_download_path)
    path_button.pack(pady=5)

    # 创建下载按钮
    download_button = tk.Button(root, text="下载论文", command=on_download)
    download_button.pack(pady=20)

    # 创建进度条
    global progress_var
    progress_var = tk.IntVar()
    global progress_bar
    progress_bar = Progressbar(root, variable=progress_var, maximum=100)
    progress_bar.pack(pady=10, fill=tk.X)

    # 创建状态标签
    global status_label
    status_label = tk.Label(root, text="")
    status_label.pack(pady=5)

    author_info = tk.Label(root, text="开发者: xiexuan\n邮箱: xiexuan@njfu.edu.cn")
    author_info.pack(pady=10)

    root.mainloop()

if __name__ == "__main__":
    create_gui()
