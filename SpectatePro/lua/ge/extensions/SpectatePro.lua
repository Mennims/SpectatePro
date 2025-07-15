local M = {}

function getVehicleOccupants(serverVehicleID)
    local vehicle = MPVehicleGE.getVehicleByServerID(serverVehicleID)
    if not vehicle then
        return {}
    end
    
    local occupants = {}
    local players = MPVehicleGE.getPlayers()
    local addedPlayerIDs = {}

    local owner, ownerID = vehicle:getOwner()
    if owner then
        table.insert(occupants, {
            playerID = ownerID,
            name = owner.name,
            isOwner = true,
            isDriver = true,
            isLocal = owner.isLocal
        })
        addedPlayerIDs[ownerID] = true
    end
    
    for spectatorID, _ in pairs(vehicle.spectators) do
        local spectator = players[spectatorID]
        if spectator and not addedPlayerIDs[spectatorID] then
            table.insert(occupants, {
                playerID = spectatorID,
                name = spectator.name,
                isOwner = false,
                isDriver = false,
                isLocal = spectator.isLocal
            })
            addedPlayerIDs[spectatorID] = true
        end
    end
    
    return occupants
end

function getCurrentVehicleInfo()
    local currentVehicle = be:getPlayerVehicle(0)
    if not currentVehicle then
        return {
            inVehicle = false,
            isDriving = false,
            isSpectating = false,
            serverVehicleID = nil,
            gameVehicleID = nil,
            vehicleOwner = nil
        }
    end
    
    local gameVehicleID = currentVehicle:getID()
    local isOwn = MPVehicleGE.isOwn(gameVehicleID)
    local serverVehicleID = MPVehicleGE.getServerVehicleID(gameVehicleID)
    
    if not serverVehicleID then
        return {
            inVehicle = true,
            isDriving = false,
            isSpectating = false,
            serverVehicleID = nil,
            gameVehicleID = gameVehicleID,
            vehicleOwner = nil
        }
    end
    
    local vehicle = MPVehicleGE.getVehicleByServerID(serverVehicleID)
    local vehicleOwner = vehicle and vehicle.ownerName or nil
    
    return {
        inVehicle = true,
        isDriving = isOwn,
        isSpectating = not isOwn,
        serverVehicleID = serverVehicleID,
        gameVehicleID = gameVehicleID,
        vehicleOwner = vehicleOwner
    }
end

function getCurrentVehicleOccupants()
    local currentVehicleInfo = getCurrentVehicleInfo()
    
    if not currentVehicleInfo.inVehicle or not currentVehicleInfo.serverVehicleID then
        return {}
    end
    
    return getVehicleOccupants(currentVehicleInfo.serverVehicleID)
end

function getTotalPlayers()
    local players = MPVehicleGE.getPlayers()
    local count = 0
    
    for playerID, player in pairs(players) do
        count = count + 1
    end
    
    return count
end

M.getVehicleOccupants = getVehicleOccupants
M.getCurrentVehicleInfo = getCurrentVehicleInfo
M.getCurrentVehicleOccupants = getCurrentVehicleOccupants
M.getTotalPlayers = getTotalPlayers

return M