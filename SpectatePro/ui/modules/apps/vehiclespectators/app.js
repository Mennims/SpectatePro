'use strict'
angular.module("beamng.apps").directive("vehiclespectators", [function () {
	return {
		templateUrl: '/ui/modules/apps/vehiclespectators/app.html',
		replace: true,
		link: function ($scope, element, attrs) {
			// Cleanup tracking
			let isDestroyed = false;
			let updateInterval = null;

			// Initialize scope variables
			$scope.currentVehicle = {
				inVehicle: false,
				isDriving: false,
				isSpectating: false,
				serverVehicleID: null,
				gameVehicleID: null,
				vehicleOwner: null
			};
			$scope.spectators = [];
			$scope.maxVisibleSpectators = 4; // Show max 4 spectator names before showing "+X more"
			$scope.totalPlayers = 0; // Track total players on server

			const LuaGetCurrentVehicleInfo = `
				(function()
					if SpectatePro.getCurrentVehicleInfo then
						return SpectatePro.getCurrentVehicleInfo()
					end
					return {
						inVehicle = false,
						isDriving = false,
						isSpectating = false,
						serverVehicleID = nil,
						gameVehicleID = nil,
						vehicleOwner = nil
					}
				end)()`;

			const LuaGetCurrentVehicleOccupants = `
				(function()
					if SpectatePro.getCurrentVehicleOccupants then
						return SpectatePro.getCurrentVehicleOccupants()
					end
					return {}
				end)()`;

			const LuaGetTotalPlayers = `
				(function()
					if SpectatePro.getTotalPlayers then
						return SpectatePro.getTotalPlayers()
					end
					return 0
				end)()`;

			// Dummy data for testing (comment out when using real data)
			const dummyVehicleInfo = {
				inVehicle: true,
				isDriving: false,
				isSpectating: true,
				serverVehicleID: 12345,
				gameVehicleID: 67890,
				vehicleOwner: "Mennims"
			};

			const dummyOccupants = [
				{
					playerID: 1,
					name: "Ken Block",
					isOwner: true,
					isDriver: true,
					isLocal: false
				},
				{
					playerID: 2,
					name: "Michael Schumacher",
					isOwner: false,
					isDriver: false,
					isLocal: true
				},
				{
					playerID: 3,
					name: "Colin McRae",
					isOwner: false,
					isDriver: false,
					isLocal: false
				},
				{
					playerID: 4,
					name: "Sébastien Loeb",
					isOwner: false,
					isDriver: false,
					isLocal: false
				},
				{
					playerID: 5,
					name: "Tommi Mäkinen",
					isOwner: false,
					isDriver: false,
					isLocal: false
				},
				{
					playerID: 6,
					name: "Juha Kankkunen",
					isOwner: false,
					isDriver: false,
					isLocal: false
				},
				{
					playerID: 7,
					name: "Kalle Rovanperä",
					isOwner: false,
					isDriver: false,
					isLocal: false
				},
				{
					playerID: 8,
					name: "Your Father",
					isOwner: false,
					isDriver: false,
					isLocal: false
				}
			];

			// Dummy total players for testing (set to > 1 to show UI)
			const dummyTotalPlayers = 8;

			// Function to separate spectators from driver
			function separateSpectators(occupants) {
				const spectators = [];
				
				for (const occupant of occupants) {
					if (!occupant.isOwner) {
						spectators.push(occupant);
					}
				}
				
				return spectators;
			}

			// Function to update vehicle and occupant information
			function updateVehicleInfo() {
				if (isDestroyed) return;

				// Use dummy data for testing (comment out this section when using real data)
				// $scope.totalPlayers = dummyTotalPlayers;
				// $scope.currentVehicle = dummyVehicleInfo;
				// $scope.spectators = separateSpectators(dummyOccupants);
				// $scope.$apply();
				// return;
				

				// First, get total players to check if UI should be hidden
				bngApi.engineLua(LuaGetTotalPlayers, (totalPlayers) => {
					if (isDestroyed) return;
					
					$scope.totalPlayers = totalPlayers || 0;
					
					// Hide UI if total players is 1 or less
					if ($scope.totalPlayers <= 1) {
						$scope.currentVehicle = {
							inVehicle: false,
							isDriving: false,
							isSpectating: false,
							serverVehicleID: null,
							gameVehicleID: null,
							vehicleOwner: null
						};
						$scope.spectators = [];
						$scope.$apply();
						return;
					}

					// Get current vehicle info
					bngApi.engineLua(LuaGetCurrentVehicleInfo, (vehicleInfo) => {
						if (isDestroyed) return;
						
						if (vehicleInfo && typeof vehicleInfo === 'object') {
							$scope.currentVehicle = vehicleInfo;
							
							// Only get occupants if we're in a vehicle with a server ID
							if (vehicleInfo.inVehicle && vehicleInfo.serverVehicleID) {
								bngApi.engineLua(LuaGetCurrentVehicleOccupants, (occupants) => {
									if (isDestroyed) return;
									
									if (occupants && Array.isArray(occupants)) {
										$scope.spectators = separateSpectators(occupants);
									} else {
										$scope.spectators = [];
									}
									$scope.$apply();
								});
							} else {
								$scope.spectators = [];
							}
						}
						$scope.$apply();
					});
				});
			}

			// Set up periodic updates
			function startUpdates() {
				if (isDestroyed) return;
				
				// Update immediately
				updateVehicleInfo();
				
				// Set up interval for updates (every 1 second)
				updateInterval = setInterval(() => {
					if (isDestroyed) return;
					updateVehicleInfo();
				}, 1000);
			}

			// Start the update cycle
			startUpdates();

			// Cleanup function
			function cleanup() {
				isDestroyed = true;

				// Clear update interval
				if (updateInterval) {
					clearInterval(updateInterval);
					updateInterval = null;
				}
			}

			// Register cleanup on scope destroy
			$scope.$on('$destroy', cleanup);
			
			// Also cleanup on element removal
			element.on('$destroy', cleanup);
		}
	}
}]); 