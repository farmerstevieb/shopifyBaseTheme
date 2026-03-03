declare let __webpack_public_path__: string;
declare let __webpack_get_script_filename__: (chunkId: string) => string;
declare let __webpack_require__: Record<string, unknown>;

const elWebpackScript = document.querySelector(`script[data-public-path]`);

if (elWebpackScript instanceof HTMLScriptElement) {
  __webpack_public_path__ =
    location.port ? "/" : elWebpackScript.dataset.publicPath!;

  const importMap = JSON.parse(elWebpackScript.textContent ?? "{}") as Record<
    string,
    string
  >;

  const getSciptFilename = __webpack_get_script_filename__;
  __webpack_get_script_filename__ = (chunkId) => {
    const fileName = getSciptFilename(chunkId);
    return fileName + (importMap[fileName] ?? "");
  };

  const getCSSFilename = __webpack_require__.miniCssF as (c: string) => string;
  __webpack_require__.miniCssF = (chunkId: string) => {
    const fileName = getCSSFilename(chunkId);
    return fileName + (importMap[fileName] ?? "");
  };
}
