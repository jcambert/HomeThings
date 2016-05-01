using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;

namespace HomeThings.Server
{
    [HubName("Blockly")]
    public class BlocklyHub:Hub
    {
    }
}