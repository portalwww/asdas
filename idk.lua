-- FE Replicate Everything In A Server From Your ClientSided Executor
-- Or In Other Words "FE Bypass"
local Network = game:GetService("NetworkClient")
function FakeAuthTicket(Player)
local Seed = (game.PlaceId*game.GameId) - (Player.UserId %
math.clamp(game.CreatorId,1,(Player.UserId/2)))
math.randomseed(Seed)
local Auth = "!RBLX_"..Version():gsub("%.","-").."_AUTH:"
local Char = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D",
"E", "F"}
for i = 1,math.random(40,56) do
Auth = Char[math.random(1,#Char)]
end
return Auth
end
local Auth = FakeAuthTicket(game:GetService("Players").LocalPlayer)
local Enabled = Enum.ReplicateInstanceDestroySetting.Enabled.Value
local Options = Instance.new("TeleportOptions", network) -- Only Viable Alternative
Class Subsitute Of Replication Settings
-- Setting Up Replication Settings
Options.Name = "ReplicationSettings"
Options:SetAttribute("InstanceDestroyReplicated", Enabled)
Options:SetAttribute("InstanceCreationReplicated", Enabled)
Options:SetAttribute("InstanceChangesReplicated", Enabled)
Options:SetAttribute("InstancePropertiesReplicated", Enabled)
Options:SetAttribute("AuthTicket", Auth)
-- Define function For Constructing Packet
function ConstructPacket(Name,Id,Auths,Data,TTL)
-- Define Table That Tricks Roblox Networking Engine
-- We Are Using RakNet As A Target Because RakNet Is Really Old And Vulnerable
local Packet =
{"RAKNET","RAKUDP",Name,Id,Auths,Data,TTL,"HIGH_PRIORITY","RELIABLE"}
return game:GetService("HttpService"):JSONEncode(Packet)
end
-- Starting Attempts
local Error,Success = pcall(function()
-- Rewrite Replication Settings with Fake Authentication
Network:RefreshReplicationSettings(true, Auth, Options)
-- Get Replicator with Fake Authentication
local Replicator = Network:GetReplicator(Auth)
-- Set Replication Rule To Replicate Malicious Behaviour
Replicator:SetReplicationRule({replicationFiltering = false,firewallWhitelist =
{game:GetService("Players").LocalPlayer},legacyFilteringEnabled =
false,replicatedInstances = {game},}
)
local IP = -- Put Server IP Here
-- Get Outbound Connections
local OutBound = Replicator:GetOutboundConnections()
local LatestPacketID = 0
for Con, ConType in pairs(OutBound) do
if ConType == 4 then
LatestPacketID = math.max(LatestPacketID, Con.id)

end
end
-- Generate Fake Encoded Authentication
local EAuth = ""
for i = #1, #Auth do
local Enc = string.sub(authTicket, i, i)
EAuth ..= string.byte(Enc)
end
-- Define Paramater Request
local Parameter = {from = ServerIP,auth = EAuth,RKSEC = tick(),PermissionIndex =
20,Request = {ServerReplicatorChange = {priority = "HIGH_PRIORITY",data =
{replicationFiltering = false,firewallWhitelist =
{{game:GetService("Players").LocalPlayer,ServerIP}},legacyFilteringEnabled =
false,replicatedInstances = {game},exclude = {},HostCanReplicate =
true,ReplicationSettings = {all = true,noReplicationBelow = -1,experimentalMode =
false,}}}}}
-- Send Malicious Packet And Trick The Server
local Response = Replicator:SendPacket(0,
ConstructPacket("ReplicationRequest",LatestPacketID+1,Auth,game:GetService("HttpSer
vice"):JSONEncode(Parameter),-1))
if Response[1]:lower():find("success") and Response[2] ~=
Enum.ConnectionError.ReplicatorTimeout then
Options.RobloxLocked = true
return true
else
error("Packet Failed")
return false
end
end)
if Success then
print("You are now able to replicate everything from your clientsided executor")
else
print("Failed, please try again")
end


