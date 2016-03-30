using Microsoft.Owin.FileSystems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using ofs = Microsoft.Owin.FileSystems;

namespace HomeThings.Server
{
    internal class EmbeddedResourceFileSystem : IFileSystem
    {
        protected readonly ofs.EmbeddedResourceFileSystem _fileSystem;

        protected readonly string[] _resourceNames;

        protected readonly string _baseNamespace;

        public EmbeddedResourceFileSystem(string baseNamespace)
        {
            _fileSystem = new ofs.EmbeddedResourceFileSystem(baseNamespace);
            _baseNamespace = baseNamespace;
            _resourceNames = Assembly.GetCallingAssembly().GetManifestResourceNames();
            
        }
        public bool TryGetDirectoryContents(string subpath, out IEnumerable<IFileInfo> contents)
        {
            if (subpath == "/")
            {
                var fileInfo = default(IFileInfo);
                var found = this.TryGetFileInfo("/index.html", out fileInfo);
                if (found)
                {
                    contents = new[] { fileInfo };
                    return true;
                }

            }
            contents = Enumerable.Empty<IFileInfo>();
            return false;
        }

        public bool TryGetFileInfo(string subpath, out IFileInfo fileInfo)
        {
            if (string.IsNullOrEmpty(subpath) || subpath[0] != '/')
            {
                fileInfo = null;
                return false;
            }

            var fixpath = (_baseNamespace + "." + subpath.Substring(1).Replace('/', '.').Replace('-', '_')).ToLower();
            fixpath = _resourceNames.FirstOrDefault(name => name.ToLower().Replace('-', '_') == fixpath);
            if (fixpath == null)
            {
                fileInfo = null;
                return false;
            }

            fixpath = "/" + fixpath.Substring(_baseNamespace.Length + 1);
            return _fileSystem.TryGetFileInfo(fixpath, out fileInfo);
        }
    }
}
