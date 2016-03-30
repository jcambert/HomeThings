using Microsoft.Owin.StaticFiles.ContentTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    internal class ContentTypeProvider: FileExtensionContentTypeProvider
    {
        public ContentTypeProvider()
        {
            Mappings.Add(".json", "application/json");
        }
    }
}
