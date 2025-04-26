--!nocheck
--!nolint
--[[
    Luauth Module
    
    4/4/2025 ~ https://github.com/dex4tw
    
]]
local isLoaded = false
local _Data = {} -- Private
local Luauth = setmetatable({}, {
    __tostring = function(self) 
        local v = ""; for x = 1, 32 do v = v .. string.char(math.random(65,122)) end
        return v
    end, -- Prevent `print`
    __index = function(self, key)
        return _Data[key]
    end,
    __newindex = function(self, key, value) -- Manage setting, e.g. Luauth["HWID"] = "ts"
        if not _Data._isInternal then return end
        _Data[key] = value
    end,
})

local loadModule = function() -- Securely load all module information
    if isLoaded then return end
    _Data._isInternal = true
    
    -- Init Module --
    Luauth.HWID = game:GetService("RbxAnalyticsService"):GetClientId()

    -- Lock Module --
    _Data._isInternal = false
    isLoaded = true

    return Luauth
end

return loadModule()
