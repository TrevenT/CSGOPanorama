'use strict';

var CharacterAnims = ( function()
{


	function _AddModifiersFromWeaponItemId ( itemId, arrModifiers )
	{
		  		                                             
		  		                                 

		  		                                                                   
		  		                                            

		var weaponName = ItemInfo.GetItemDefinitionName( itemId );
		arrModifiers.push( weaponName );

		var weaponType = InventoryAPI.GetWeaponTypeString( itemId );
		arrModifiers.push( weaponType );
	}

	function _NormalizeTeamName ( team, bShort = false )
	{
		team = String(team).toLowerCase();
		
		switch ( team )
		{
			case '2':
			case 't':
			case 'terrorist':
			case 'team_t':
				
				return bShort? 't' : 'terrorist';
			
			case '3':
			case 'ct':
			case 'counter-terrorist':
			case 'team_ct':
				return 'ct';
			
			default:
				return '';
			
		}
	}

	function _TeamForEquip ( team )
	{
		team = team.toLowerCase();
		
		switch ( team )
		{
			case '2':
			case 't':
			case 'terrorist':
			case 'team_t':
				
				return 't';
			
			case '3':
			case 'ct':
			case 'counter-terrorist':
			case 'team_ct':
				return 'ct';
			
			default:
				return '';
			
		}		

	}
	

	var _PlayAnimsOnPanel = function ( importedSettings, bDontStompModel = false )
	{
		  
		                                                       
		                                                   
		  

		                                                                                        
		                                                                                
		                         
		
		if ( importedSettings === null ) 
		{
			return;
		}

		var settings = ItemInfo.DeepCopyVanityCharacterSettings( importedSettings );

		if ( !settings.team || settings.team == "" )
			settings.team = 'ct';
		
		settings.team = _NormalizeTeamName( settings.team );

		if ( settings.modelOverride ) {
			settings.model = settings.modelOverride;
			          
			                            
			 
	  				                                                                        
			 
			          
		} else {
			                                                      
			settings.model = ItemInfo.GetModelPlayer( settings.charItemId );
			                                                               
			if ( !settings.model )
			{
				if ( settings.team == 'ct' )
					settings.model = "models/player/custom_player/legacy/ctm_sas.mdl";
				else
					settings.model = "models/player/custom_player/legacy/tm_phoenix.mdl";
			}
		}

		var wid = settings.weaponItemId;
		
		var playerPanel = settings.panel;
		_CancelScheduledAnim( playerPanel );
		_ResetLastRandomAnimHandle( playerPanel );
		
		playerPanel.ResetAnimation( false );
		playerPanel.SetSceneAngles( 0, 0, 0, false );

		if ( settings.manifest )
			playerPanel.SetScene( settings.manifest, settings.model, false );

		if ( !bDontStompModel )
		{
			playerPanel.SetPlayerCharacterItemID( settings.charItemId );
			playerPanel.SetPlayerModel( settings.model );
		}

		playerPanel.EquipPlayerWithItem( wid );
		playerPanel.EquipPlayerWithItem( settings.glovesItemId );

		playerPanel.ResetActivityModifiers();
		
		playerPanel.ApplyActivityModifier( settings.team );

		if ( !( 'arrModifiers' in settings ) )
		{
			settings.arrModifiers = [];
		}

		_AddModifiersFromWeaponItemId( wid, settings.arrModifiers );

		settings.arrModifiers.forEach( mod => playerPanel.ApplyActivityModifier( mod ) );
		
		if ( !('activity' in settings ) || settings.activity == "" )
		{
			settings.activity = 'ACT_CSGO_UIPLAYER_IDLE';
		}
		
  		                                                  
		
		if ( !( 'immediate' in settings ) || settings.immediate == "" )
		{
			settings.immediate = true;
		}

		playerPanel.PlayActivity( settings.activity, settings.immediate );

		var cam = 0;

		if ( 'cameraPreset' in settings )
		{
			cam = settings.cameraPreset;
			                                               
		}
		else
		{
			cam = _GetCameraPreset( settings.team, ItemInfo.GetSlot( wid ), ItemInfo.GetItemDefinitionName( wid ) );

			          
			                         
			                                                        
			                                                    
			                                          

			                                                                                
			                    
			 
				                                                                            
				                                                                                                        

				                                                                                      
				                                                                                   
				                                                                      
			 
			          
		}

		playerPanel.SetCameraPreset( Number( cam ), false );
	};

	var _CancelScheduledAnim = function ( playerPanel )
	{
		                                                                                             
		if ( playerPanel.Data().handle )
		{
			$.CancelScheduled( playerPanel.Data().handle );
			playerPanel.Data().handle = null;
		}
	};

	var _ResetLastRandomAnimHandle = function ( playerPanel)
	{
		if ( playerPanel.Data().lastRandomAnim !== -1 ) {
			playerPanel.Data().lastRandomAnim = -1;
		}
	};

	var _ItemHasCharacterAnims = function( team, loadoutSlot, selectedWeapon, itemId )
	{
		                                                                                      
		var hasAnims = _GetAnims( team, loadoutSlot, selectedWeapon, itemId ) !== undefined ? true : false;

  		                                                 
		return hasAnims;
	};

	var _GetValidCharacterModels = function( bUniquePerTeamModelsOnly )
	{

		InventoryAPI.SetInventorySortAndFilters ( 'inv_sort_rarity', false, 'customplayer', '', '' );
		var count = InventoryAPI.GetInventoryCount();
		var itemsList = [];
		var uniqueTracker = {};

		for( var i = 0 ; i < count ; i++ )
		{
			var itemId = InventoryAPI.GetInventoryItemIDByIndex( i );
			
			var modelplayer = ItemInfo.GetModelPlayer( itemId );
			if ( !modelplayer )
				continue;

			var team = ( ItemInfo.GetTeam( itemId ).search( 'Team_T' ) === -1 ) ? 'ct' : 't';
			if ( bUniquePerTeamModelsOnly )
			{	                                           
				if ( uniqueTracker.hasOwnProperty( team + modelplayer ) )
					continue;
				uniqueTracker[ team + modelplayer ] = 1;
			}

			var label = ItemInfo.GetName( itemId );
			var entry = {
				label: label,
				team: team,
				itemId: itemId
			};

			itemsList.push( entry );
		}

		return itemsList;


	};

	                                                                                                    
	                                                                                                      
	                                                               
	                                                                                                    
	var _GetCameraPreset = function ( team, slot, weapon )
	{	
		team = team.toLowerCase();
		slot = slot.toLowerCase();
		weapon = weapon.toLowerCase();

		switch ( team )
		{
			case 'ct':
				switch ( slot )
				{
					case 'melee':
						return 1;
					
					case 'secondary':
					case 'smg':
						switch ( weapon )
						{
							case 'weapon_elite':
								return 1;
							
							case 'weapon_p90':
							case 'weapon_mp9':
							case 'weapon_ump45':
							case 'weapon_bizon':
							case 'weapon_mp5sd':
								return 2;
							
							case 'weapon_mp7':
								return 4;	
							
							default:
								return 0;
						}

					case 'rifle':
						switch ( weapon )
						{
							case 'weapon_famas':
							case 'weapon_aug':
								return 2;
							
							default:
								return 1;
						}

					case 'heavy':
						switch ( weapon )
						{
							case 'weapon_nova':
							case 'weapon_xm1014':
							case 'weapon_mag7':
								return 2;
						}	
						
					default:
						switch ( weapon )
						{
							case 'weapon_flashbang':
							case 'weapon_decoy':
							case 'weapon_smokegrenade':
							case 'weapon_incgrenade':
							case 'weapon_hegrenade':
								return 0;
									
							default:
								return 3;
						}
				}

			case 'terrorist':
				switch ( slot )
				{
					case 'melee':
						return 1;
					
					case 'secondary':
					case 'smg':
						switch ( weapon )
						{
							case 'weapon_elite':
							case 'weapon_mp5sd':
							case 'weapon_mac10':
								return 1;
							
							case 'weapon_ump45':
								return 4;
							
							default:
								return 2;
						}

					case 'heavy':
					case 'rifle':
						return 1;
				
					default:
						switch ( weapon )
						{
							case 'weapon_c4':
							case 'weapon_flashbang':
							case 'weapon_decoy':	
							case 'weapon_smokegrenade':
							case 'weapon_incgrenade':
							case 'weapon_hegrenade':
							case 'weapon_molotov':
								return 0;
						}	
				}
		}
	};

	var _GetAnims = function( team, loadoutSlot, weapon, itemId )
	{
		if ( !loadoutSlot )
		{
			if ( team == 'ct' )
			{
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_knife_walkup',
					idle: 'ct_loadout_knife_idle',
					animsList: [
						'ct_loadout_knife_headtilt',
						'ct_loadout_knife_lookat01',
						'ct_loadout_knife_lookat02',
						'ct_loadout_knife_shrug',
						'ct_loadout_knife_flip01',
						'ct_loadout_knife_slicedice01',
						'ct_loadout_knife_slicedice02',
						'ct_loadout_knife_backflip'
					]
				};
			}
			else
			{
				return {
					cameraPreset: 1,
					intro: 't_loadout_knife_walkup',
					idle: 't_loadout_knife_idle',
					animsList: [
						't_loadout_knife_weightshift01',
						't_loadout_knife_headtilt',
						't_loadout_knife_bladewipe',
						't_loadout_knife_threaten',
						't_loadout_knife_flip_frontandback',
						't_loadout_knife_fancymoves',
						't_loadout_knife_slicedice01',
						't_loadout_knife_slicedice02',
						't_loadout_knife_flipandslice'
					]
				};
			}
		}


		if ( team == 'ct' )
		{
			if ( loadoutSlot.indexOf( 'melee' ) !== -1 )
			{
				              
				var defName = InventoryAPI.GetItemDefinitionName( itemId );
				if ( defName.indexOf( 'push' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_push_walkup',
						idle: 'ct_loadout_push_idle',
						animsList: [
							'ct_loadout_push_lookat01',
							'ct_loadout_push_lookat02',
							'ct_loadout_push_shrug',
							'ct_loadout_push_lookat03',
							'ct_loadout_push_raise'
						]
					};
				}
				                
				defName = InventoryAPI.GetItemDefinitionName( itemId );
				if ( defName.indexOf( 'karambit' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_knife_walkup',
						idle: 'ct_loadout_knife_idle',
						animsList: [
							'ct_loadout_knife_headtilt',
							'ct_loadout_knife_lookat01',
							'ct_loadout_knife_lookat02',
							'ct_loadout_knife_shrug',
							'ct_loadout_knife_flip01',
							'ct_loadout_knife_slicedice02'
						]
					};
				}

				          
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_knife_walkup',
					idle: 'ct_loadout_knife_idle',
					animsList: [
						'ct_loadout_knife_headtilt',
						'ct_loadout_knife_lookat01',
						'ct_loadout_knife_lookat02',
						'ct_loadout_knife_shrug',
						'ct_loadout_knife_flip01',
						'ct_loadout_knife_slicedice01',
						'ct_loadout_knife_slicedice02',
						'ct_loadout_knife_backflip'
					]
				};
			}
			           
			if ( loadoutSlot.indexOf( 'secondary' ) !== -1 || loadoutSlot.indexOf( 'smg' ) !== -1 )
			{
				               
				if ( weapon.indexOf( 'elite' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_dual_walkup',
						idle: 'ct_loadout_dual_idle',
						animsList: [
							'ct_loadout_dual_lookat01',
							'ct_loadout_dual_lookat02',
							'ct_loadout_dual_shrug',
							'ct_loadout_dual_lookat03',
							'ct_loadout_dual_raise'
						]
					};
				}
				      
				if ( weapon.indexOf( 'p90' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_p90_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				      
				if ( weapon.indexOf( 'mp9' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_mp9_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				        
				if ( weapon.indexOf( 'ump45' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_ump45_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				        
				if ( weapon.indexOf( 'bizon' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_p90_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				      
				if ( weapon.indexOf( 'mp7' ) !== -1 )
				{
					return {
						cameraPreset: 4,
						intro: 'ct_loadout_mp7_walkup',
						idle: 'ct_loadout_mp7_idle',
						animsList: [
							'ct_loadout_mp7_weightshift',
							'ct_loadout_mp7_lookscreenLshakehand',
							'ct_loadout_mp7_lookbehindscreenL',
							'ct_loadout_mp7_lookatgun',
							'ct_loadout_mp7_scanscreenL'
						]
					};
				}
				        
				if ( weapon.indexOf( 'mp5sd' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_mp5sd_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				          
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_pistol01_walkup',
					idle: 'ct_loadout_pistol01_idle',
					animsList: [
						'ct_loadout_pistol01_lookscreenLshakehand',
						'ct_loadout_pistol01_weightshift',
						'ct_loadout_pistol01_lookbehindscreenL',
						'ct_loadout_pistol01_lookatgun',
						'ct_loadout_pistol01_scanscreenL'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'rifle' ) !== -1 )
			{
				if ( weapon.indexOf( 'famas' ) !== -1 )
				{
					  					                 
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_famas_walkup',
						idle: 'ct_loadout_famas_idle',
						animsList: [
							'ct_loadout_famas_weightshift01',
							'ct_loadout_famas_lookbehind01',
							'ct_loadout_famas_lookatwatch',
							'ct_loadout_famas_lookbehind02'
						]
					};
					
				}
				
				if ( weapon.indexOf( 'm4a1' ) !== -1 || weapon.indexOf( 'm4a1_silencer' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_walkup_handrepo_m4',
						idle: 'ct_loadout_rifle_idle_handrepo_m4',
						animsList: [
							'ct_loadout_rifle_lookat_handrepo_m4',
							'ct_loadout_rifle_shouldershrug_handrepo_m4',
							'ct_loadout_rifle_weightshift_handrepo_m4'
						]
					};
				}
				if ( weapon.indexOf( 'aug' ) !== -1 )
				{
					  					               
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_rifle_walkup_handrepo_aug',
						idle: 'ct_loadout_rifle_idle_handrepo_aug',
						animsList: [
							'ct_loadout_rifle_weightshift01_handrepo_aug',
							'ct_loadout_rifle_lookbehind01_handrepo_aug',
							'ct_loadout_rifle_lookatwatch_handrepo_aug',
							'ct_loadout_rifle_lookbehind02_handrepo_aug'
						]
					};
					
				}
				if ( weapon.indexOf( 'ssg08' ) !== -1 )
				{
					  					                 
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_ssg08_walkup',
						idle: 'ct_loadout_rifle_ssg08_idle',
						animsList: [
							'ct_loadout_rifle_ssg08_lookat',
							'ct_loadout_rifle_ssg08_shouldershrug',
							'ct_loadout_rifle_ssg08_weightshift'
						]
					};
					
				}
				if ( weapon.indexOf( 'awp' ) !== -1 )
				{
					  					               
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_awp_walkup',
						idle: 'ct_loadout_rifle_awp_idle',
						animsList: [
							'ct_loadout_rifle_awp_lookat',
							'ct_loadout_rifle_awp_shouldershrug',
							'ct_loadout_rifle_awp_weightshift'
						]
					};
					
				}
				
				                  
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_rifle_scar_walkup',
					idle: 'ct_loadout_rifle_scar_idle',
					animsList: [
						'ct_loadout_rifle_scar_lookat',
						'ct_loadout_rifle_scar_shouldershrug',
						'ct_loadout_rifle_scar_weightshift'
					]
				};
				
			}

			if ( loadoutSlot.indexOf( 'heavy' ) !== -1 )
			{
				if ( weapon.indexOf( 'nova' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_nova_walkup',
						idle: 'ct_loadout_nova_idle',
						animsList: [
							'ct_loadout_nova_weightshift',
							'ct_loadout_nova_shrug',
							'ct_loadout_nova_lookbehind',
							'ct_loadout_nova_gunlift',
							'ct_loadout_nova_lookat01'
						]
					};
				}
				if ( weapon.indexOf( 'xm1014' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_xm1014_walkup',
						idle: 'ct_loadout_xm1014_idle',
						animsList: [
							'ct_loadout_xm1014_weightshift',
							'ct_loadout_xm1014_shrug',
							'ct_loadout_xm1014_lookbehind',
							'ct_loadout_xm1014_gunlift',
							'ct_loadout_xm1014_lookat01'
						]
					};
				}
				if ( weapon.indexOf( 'mag7' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_mag7_walkup',
						idle: 'ct_loadout_mag7_idle',
						animsList: [
							'ct_loadout_mag7_weightshift01',
							'ct_loadout_mag7_lookbehind01',
							'ct_loadout_mag7_lookatwatch',
							'ct_loadout_mag7_lookbehind02'
						]
					};
					
				}
				if ( weapon.indexOf( 'negev' ) !== -1 )
				{
					return {
						cameraPreset: 3,
						intro: 'ct_loadout_negev_walkup',
						idle: 'ct_loadout_negev_idle',
						animsList: [
							'ct_loadout_negev_lookat01',
							'ct_loadout_negev_lookat02',
							'ct_loadout_negev_lookback',
							'ct_loadout_negev_lift01',
							'ct_loadout_negev_lift02',
							'ct_loadout_negev_weightshift'
							  							                      
						]
					};
				}
				
			if ( loadoutSlot.indexOf( 'flashbang' ) !== -1 || loadoutSlot.indexOf( 'decoy') !== -1 )
			{
				                              
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_frag01_walkup',
					idle: 'ct_loadout_frag01_idle',
					animsList: [
						'ct_loadout_frag01_touch',
						'ct_loadout_frag01_lookat01',
						'ct_loadout_frag01_toss01',
						'ct_loadout_frag01_toss02'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'smokegrenade' ) !== -1 || loadoutSlot.indexOf( 'incgrenade') !== -1 || loadoutSlot.indexOf( 'hegrenade') !== -1 )
			{
				                                  
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_frag02_walkup',
					idle: 'ct_loadout_frag02_idle',
					animsList: [
						'ct_loadout_frag02_touch',
						'ct_loadout_frag02_lookat01',
						'ct_loadout_frag02_toss01',
						'ct_loadout_frag02_toss02'
					]
				};
			}
			
		
				          
				return {
					cameraPreset: 3,
					intro: 'ct_loadout_heavy_walkup',
					idle: 'ct_loadout_heavy_idle',
					animsList: [
						'ct_loadout_heavy_lookat01',
						'ct_loadout_heavy_lookat02',
						'ct_loadout_heavy_lookback',
						'ct_loadout_heavy_lift01',
						'ct_loadout_heavy_lift02',
						'ct_loadout_heavy_weightshift'
						  						                      
					]
				};
			}
		}
		else
		{
			          
			if ( loadoutSlot.indexOf( 'c4' ) !== -1 )
			{
				    
				return {
					cameraPreset: 0,
					intro: 't_loadout_c4_walkup',
					idle: 't_loadout_c4_idle',
					animsList: [
						't_loadout_c4_lookat01',
						't_loadout_c4_catch',
						't_loadout_c4_bobble',
						't_loadout_c4_lookat02'
					]
				};
			}

			if ( loadoutSlot.indexOf( 'flashbang' ) !== -1 || loadoutSlot.indexOf( 'decoy' ) !== -1 )
			{
				                              
				return {
					cameraPreset: 0,
					intro: 't_loadout_frag_walkup',
					idle: 't_loadout_frag_idle',
					animsList: [
						't_loadout_frag_lookat',
						't_loadout_frag_toss01',
						't_loadout_frag_toss02',
						't_loadout_frag_weightshift'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'smokegrenade' ) !== -1 || loadoutSlot.indexOf( 'incgrenade' ) !== -1 || loadoutSlot.indexOf( 'hegrenade' ) !== -1 )
			{
				                                  
				return {
					cameraPreset: 0,
					intro: 't_loadout_molotov_walkup',
					idle: 't_loadout_molotov_idle',
					animsList: [
						't_loadout_molotov_lookat',
						't_loadout_molotov_toss01',
						't_loadout_smoke_incen_toss02',
						't_loadout_molotov_weightshift'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'molotov' ) !== -1 )
			{
				              
				return {
					cameraPreset: 0,
					intro: 't_loadout_molotov_walkup',
					idle: 't_loadout_molotov_idle',
					animsList: [
						't_loadout_molotov_lookat',
						't_loadout_molotov_toss01',
						't_loadout_molotov_toss02',
						't_loadout_molotov_weightshift'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'melee' ) !== -1 )
			{
				             
				var defName = InventoryAPI.GetItemDefinitionName( itemId );
				if ( defName.indexOf( 'push' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_push_walkup',
						idle: 't_loadout_push_idle',
						animsList: [
							't_loadout_push_bellyrub',
							't_loadout_push_lookat01',
							't_loadout_push_lookat02',
							't_loadout_push_aimknife',
							't_loadout_push_lookat03',
							't_loadout_push_headtilt'
						]
					};
				}
				                
				defName = InventoryAPI.GetItemDefinitionName( itemId );
				if ( defName.indexOf( 'karambit' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_knife_walkup',
						idle: 't_loadout_knife_idle',
						animsList: [
							't_loadout_knife_weightshift01',
							't_loadout_knife_headtilt',
							't_loadout_knife_threaten',
							't_loadout_knife_flip_frontandback',
							't_loadout_knife_fancymoves',
							't_loadout_knife_slicedice01',
							't_loadout_knife_slicedice02',
							't_loadout_knife_flipandslice'
						]
					};
				}
				          
				return {
					cameraPreset: 1,
					intro: 't_loadout_knife_walkup',
					idle: 't_loadout_knife_idle',
					animsList: [
						't_loadout_knife_weightshift01',
						't_loadout_knife_headtilt',
						't_loadout_knife_bladewipe',
						't_loadout_knife_threaten',
						't_loadout_knife_flip_frontandback',
						't_loadout_knife_fancymoves',
						't_loadout_knife_slicedice01',
						't_loadout_knife_slicedice02',
						't_loadout_knife_flipandslice'
					]
				};
			}
			if ( loadoutSlot.indexOf( 'secondary' ) !== -1 || loadoutSlot.indexOf( 'smg' ) !== -1 )
			{
				if ( weapon.indexOf( 'elite' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_dual_walkup',
						idle: 't_loadout_dual_idle',
						animsList: [
							't_loadout_dual_bellyrub',
							't_loadout_dual_lookatgun01',
							't_loadout_dual_lookatgun02',
							't_loadout_dual_lookatgun03',
							't_loadout_dual_headtilt'
						]
					};
				}
				
				if ( weapon.indexOf( 'revolver' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_pistol_walkup',
						idle: 't_loadout_pistol_idle',
						animsList: [
							't_loadout_pistol_weightshift',
							't_loadout_pistol_lookat_pistol',
							't_loadout_pistol_lookat_pistol02',
							't_loadout_pistol_headscratch',
							't_loadout_pistol_buttscratch'
						]
					};
				}
				if ( weapon.indexOf( 'p90' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_p90_walkup',
						idle: 't_loadout_p90_idle',
						animsList: [
							't_loadout_p90_weightshift',
							't_loadout_p90_lookataround',
							't_loadout_p90_lookatgun',
							't_loadout_p90_lookaround02',
							't_loadout_p90_spray',
							't_loadout_p90_lookaround03'
						]
					};
				}
				if ( weapon.indexOf( 'ump45' ) !== -1 )
				{
					return {
						cameraPreset: 4,
						intro: 't_loadout_ump45_walkup',
						idle: 't_loadout_ump45_idle',
						animsList: [
							't_loadout_ump45_weightshift',
							't_loadout_ump45_lookataround',
							't_loadout_ump45_lookatgun',
							't_loadout_ump45_lookaround02',
							't_loadout_ump45_spray',
							't_loadout_ump45_lookaround03'
						]
					};
				}
				if ( weapon.indexOf( 'mp5sd' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_shotgun_xm_walkup',
						idle: 't_loadout_shotgun_xm_idle',
						animsList: [
							't_loadout_shotgun_xm_weightshift',
							't_loadout_shotgun_xm_lookat01',
							't_loadout_shotgun_xm_shrug',
							't_loadout_shotgun_xm_headcock',
							't_loadout_shotgun_xm_headgrab',
							't_loadout_shotgun_xm_bellyscratch',
							't_loadout_shotgun_xm_lookback'
						]
					};
				}
				if ( weapon.indexOf( 'mp7' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_mp7_walkup',
						idle: 't_loadout_mp7_idle',
						animsList: [
							't_loadout_mp7_weightshift',
							't_loadout_mp7_lookataround',
							't_loadout_mp7_lookatgun',
							't_loadout_mp7_lookaround02',
							't_loadout_mp7_spray',
							't_loadout_mp7_lookaround03'
						]
					};
				}
				if ( weapon.indexOf( 'bizon' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_bizon_walkup',
						idle: 't_loadout_bizon_idle',
						animsList: [
							't_loadout_bizon_weightshift',
							't_loadout_bizon_lookataround',
							't_loadout_bizon_lookatgun',
							't_loadout_bizon_lookaround02',
							't_loadout_bizon_spray',
							't_loadout_bizon_lookaround03'
						]
					};
				}
				         
				if ( weapon.indexOf( 'mac10' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_shotgun_xm_walkup',
						idle: 't_loadout_shotgun_xm_idle',
						animsList: [
							't_loadout_shotgun_xm_weightshift',
							't_loadout_shotgun_xm_lookat01',
							't_loadout_shotgun_xm_shrug',
							't_loadout_shotgun_xm_headcock',
							't_loadout_shotgun_xm_headgrab',
							't_loadout_shotgun_xm_bellyscratch',
							't_loadout_shotgun_xm_lookback'
						]
					};
				}
				return {
					cameraPreset: 2,
					intro: 't_loadout_pistol_walkup',
					idle: 't_loadout_pistol_idle',
					animsList: [
						't_loadout_pistol_weightshift',
						't_loadout_pistol_lookat_pistol',
						't_loadout_pistol_slidepull',
						't_loadout_pistol_lookat_pistol02',
						't_loadout_pistol_headscratch',
						't_loadout_pistol_buttscratch'
					]
				};
			}

			if ( loadoutSlot.indexOf( 'heavy' ) !== -1 )
			{
				if ( weapon.indexOf( 'negev' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_heavy_walkup',
						idle: 't_loadout_heavy_idle',
						animsList: [
							't_loadout_heavy_lookaround01',
							't_loadout_heavy_lookleft',
							't_loadout_heavy_lookaround02',
							't_loadout_heavy_hoist',
							't_loadout_heavy_lookatgun01',
							't_loadout_heavy_lookaround03'
						]
					};
				}
				if ( weapon.indexOf( 'm249' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_heavy_m249_walkup',
						idle: 't_loadout_heavy_m249_idle',
						animsList: [
							't_loadout_heavy_m249_lookaround01',
							't_loadout_heavy_m249_lookleft',
							't_loadout_heavy_m249_lookaround02',
							't_loadout_heavy_m249_hoist',
							't_loadout_heavy_m249_lookatgun01',
							't_loadout_heavy_m249_lookaround03'
						]
					};
				}
				if ( weapon.indexOf( 'xm1014' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_shotgun_xm_walkup',
						idle: 't_loadout_shotgun_xm_idle',
						animsList: [
							't_loadout_shotgun_xm_weightshift',
							't_loadout_shotgun_xm_lookat01',
							't_loadout_shotgun_xm_shrug',
							't_loadout_shotgun_xm_headcock',
							't_loadout_shotgun_xm_headgrab',
							't_loadout_shotgun_xm_bellyscratch',
							't_loadout_shotgun_xm_lookback'
						]
					};
				}
				                           
				return {
					cameraPreset: 1,
					intro: 't_loadout_shotgun_walkup',
					idle: 't_loadout_shotgun_idle',
					animsList: [
						't_loadout_shotgun_weightshift',
						't_loadout_shotgun_lookat01',
						't_loadout_shotgun_shrug',
						't_loadout_shotgun_headcock',
						't_loadout_shotgun_headgrab',
						't_loadout_shotgun_bellyscratch',
						't_loadout_shotgun_lookback'
					]
				};
			}
			if ( loadoutSlot.indexOf( 'rifle' ) !== -1 )
			{
				if ( weapon.indexOf( 'awp' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_rifle02_walkup_awp',
						idle: 't_loadout_rifle02_idle_awp',
						animsList: [
							't_loadout_rifle02_weightshift_awp',
							't_loadout_rifle02_lookback_awp',
							't_loadout_rifle02_lookaround_awp',
							't_loadout_rifle02_lookback02_awp',
							't_loadout_rifle02_lookbatgun_awp'
						]
					};
				}
				
				if ( weapon.indexOf( 'galilar' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_rifle02_walkup_galil',
						idle: 't_loadout_rifle02_idle_galil',
						animsList: [
							't_loadout_rifle02_weightshift_galil',
							't_loadout_rifle02_lookback_galil',
							't_loadout_rifle02_lookaround_galil',
							't_loadout_rifle02_lookback02_galil',
							't_loadout_rifle02_lookbatgun_galil'
						]
					};
				}
				
				if ( weapon.indexOf( 'g3sg1' ) !== -1 ) 
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_rifle02_walkup_g3sg',
						idle: 't_loadout_rifle02_idle_g3sg',
						animsList: [
							't_loadout_rifle02_weightshift_g3sg',
							't_loadout_rifle02_lookback_g3sg',
							't_loadout_rifle02_lookaround_g3sg',
							't_loadout_rifle02_lookback02_g3sg',
							't_loadout_rifle02_lookbatgun_g3sg'
						]
					};
				}
				
				          
				return {
					cameraPreset: 1,
					intro: 't_loadout_rifle02_walkup',
					idle: 't_loadout_rifle02_idle',
					animsList: [
						't_loadout_rifle02_weightshift',
						't_loadout_rifle02_lookback',
						't_loadout_rifle02_lookaround',
						't_loadout_rifle02_lookback02',
						't_loadout_rifle02_lookatgun'
						  						                             
					]
				};
			}
		}
	};

	return {
		PlayAnimsOnPanel			: _PlayAnimsOnPanel,
		CancelScheduledAnim			: _CancelScheduledAnim,
		ItemHasCharacterAnims		: _ItemHasCharacterAnims,
		GetAnims					: _GetAnims,
		GetValidCharacterModels		: _GetValidCharacterModels,
		NormalizeTeamName			: _NormalizeTeamName
	};
})();