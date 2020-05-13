'use strict';

var ItemInfo = ( function() {
	var _GetRarityColor = function( id )
	{
		return InventoryAPI.GetItemRarityColor( id );
	};

                                    
	var _GetFormattedName = function ( id )
	{
	    var strName = _GetName( id );

	    if ( InventoryAPI.HasCustomName( id ) )
	    {
	        return new CFormattedText( '#CSGO_ItemName_Custom', { item_name: strName } );
	    }
	    else
	    {
	                                                                                                   
	        var splitLoc = strName.indexOf('|');
            
	        if ( splitLoc >= 0 )
	        {
	            var strWeaponName = strName.substr( 0, splitLoc ).trimRight();                                          
	            var strPaintName  = strName.substr( splitLoc + 1 ).trimLeft();                                      

	            return new CFormattedText( '#CSGO_ItemName_Painted', { item_name: strWeaponName, paintkit_name: strPaintName } );
	        }

	        return new CFormattedText( '#CSGO_ItemName_Base', { item_name: strName } );
	    }
	};

	var _AddItemToShuffle = function( id, team )
	{
		return LoadoutAPI.AddItemToShuffle( id, team );
	};

	var _RemoveItemFromShuffle = function( id, team )
	{
		return LoadoutAPI.RemoveItemFromShuffle( id, team );
	};

	var _IsItemInShuffleForTeam = function( id, team )
	{
		return LoadoutAPI.IsItemInShuffleForTeam( id, team );
	};

	var _ClearShuffle = function( id, team )
	{
		return LoadoutAPI.ClearShuffle ( id, team );
	};

	var _SetShuffleEnabled = function ( id, team, enable )
	{
		return LoadoutAPI.SetShuffleEnabled( id, team, enable );
	};

	var _IsShuffleEnabled = function ( id, team )
	{
		return LoadoutAPI.IsShuffleEnabled( id, team );
	};

	var _IsShuffleAllowed = function ( id )
	{
		return LoadoutAPI.IsShuffleAllowed( id );
	};

	var _CountItemsInInventoryForShuffleSlot = function ( id, team )
	{
		return LoadoutAPI.CountItemsInInventoryForShuffleSlot( id, team );
	};

	var _EnsureShuffleItemEquipped = function ( itemID, team )
	{
		var equippedItemID = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot( itemID, team );
		if ( !LoadoutAPI.IsItemInShuffleForTeam( equippedItemID, team ) )
		{
			LoadoutAPI.ShuffleEquipmentInSlot( equippedItemID, team );
		}
	};

	var _GetName = function( id )
	{
		return InventoryAPI.GetItemName( id );
	};

	var _IsEquippedForCT = function( id )
	{
		return InventoryAPI.IsEquipped( id, 'ct' );
	};

	var _IsEquippedForT = function( id )
	{
		return InventoryAPI.IsEquipped( id, 't' );
	};

	var _IsEquippedForNoTeam = function( id )
	{
		return InventoryAPI.IsEquipped( id, "noteam" );
	};

	var _IsEquipped = function( id, team )
	{
		return InventoryAPI.IsEquipped( id, team );
	};

	var _GetSlot = function( id )
	{
		return InventoryAPI.GetSlot( id );
	};

	var _GetSlotSubPosition = function( id )
	{
		return InventoryAPI.GetSlotSubPosition( id );
	};

	var _GetTeam = function( id )
	{
		return InventoryAPI.GetItemTeam( id );
	};

	var _IsSpraySealed = function( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'spray' );
	};

	var _IsSprayPaint = function( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'spraypaint' );
	};

	var _IsTradeUpContract = function ( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'Recipe Trade Up' );
	};

	var _GetSprayTintColor = function( id )
	{
		return InventoryAPI.GetSprayTintColorCode( id );
	};

	var _IsTool = function( id )
	{
		return InventoryAPI.IsTool( id );
	};

	var _GetCapabilitybyIndex = function( id, index )
	{
		return InventoryAPI.GetItemCapabilityByIndex( id, index );
	};

	var _GetCapabilityCount = function( id )
	{
		return InventoryAPI.GetItemCapabilitiesCount( id );
	};

	var _ItemHasCapability = function( id, capName )
	{
		var caps = [];
		var capCount = _GetCapabilityCount( id );

		for ( var i = 0; i < capCount; i++ )
		{
			caps.push( _GetCapabilitybyIndex( id, i ) );
		}

		return caps.includes( capName );
	};

	var _GetChosenActionItemsCount = function( id, capability )
	{
		return InventoryAPI.GetChosenActionItemsCount( id, capability );
	};

	var _GetChosenActionItemIDByIndex = function( id, capability, index )
	{
		return InventoryAPI.GetChosenActionItemIDByIndex( id, capability, index );
	};

	var _GetStickerSlotCount = function( id )
	{
		return InventoryAPI.GetItemStickerSlotCount( id );
	};

	var _GetStickerCount = function( id )
	{
		return InventoryAPI.GetItemStickerCount( id );
	};

	var _GetitemStickerList = function( id )
	{
		var count = _GetStickerCount( id );
		var stickerList = [];

		for ( var i = 0; i < count; i++ )
		{
			var image = _GetStickerImageByIndex( id, i );
			var oStickerInfo = {
				image: _GetStickerImageByIndex( id, i ),
				name: _GetStickerNameByIndex( id, i )
			}
			stickerList.push( oStickerInfo );
		}

		return stickerList;
	};

	var _GetStickerImageByIndex = function( id, index )
	{
		return InventoryAPI.GetItemStickerImageByIndex( id, index );
	};

	var _GetStickerNameByIndex = function( id, index )
	{
		return InventoryAPI.GetItemStickerNameByIndex( id, index )
	};

	var _GetItemPickUpMethod = function( id )
	{
		return InventoryAPI.GetItemPickupMethod( id );
	};

	var _GetLoadoutPrice = function( id, subposition )
	{
		var team = _IsEquippedForCT( id ) ? 'ct' : 't';
		return LoadoutAPI.GetItemGamePrice( team, _GetSlotSubPosition( id ).toString() );
	};

	var _GetStoreOriginalPrice = function( id, count )
	{
		return StoreAPI.GetStoreItemOriginalPrice( id, count );                                                 
	};

	var _GetStoreSalePrice = function( id, count )
	{
		return StoreAPI.GetStoreItemSalePrice( id, count );                                                 
	};

	var _GetStoreSalePercentReduction = function( id, count )
	{
		return StoreAPI.GetStoreItemPercentReduction( id, count );                                                 
	};

	var _ItemPurchase = function( id )
	{
		                                                
		                                                    
		StoreAPI.StoreItemPurchase( id );
	};

	var _IsStatTrak = function( id )
	{
		var numIsStatTrak = InventoryAPI.GetRawDefinitionKey( id , "will_produce_stattrak" );

		return ( Number( numIsStatTrak ) === 1 ) ? true : false;
	};

	var _IsEquippalbleButNotAWeapon = function( id )
	{
		var subSlot = _GetSlotSubPosition( id );
		return ( subSlot === "flair0" || subSlot === "musickit" || subSlot === "spray0" );
	};

	var _IsItemCt = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_CT';
	};
		
	var _IsItemT = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_T';
	};

	var _IsItemAnyTeam = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_Any';
	};

	var _GetItemDefinitionName = function( id )
	{
		return InventoryAPI.GetItemDefinitionName( id );
	};

	var _ItemMatchDefName = function( id, defName )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, defName );
	};

	var _ItemDefinitionNameSubstrMatch = function( id, defSubstr )
	{
		var itemDefName = InventoryAPI.GetItemDefinitionName( id );
		return ( itemDefName && ( itemDefName.indexOf( defSubstr ) != -1 ) );
	};

	var _GetFauxReplacementItemID = function( id, purpose )
	{
		                                                                                 
		                                                                                
		                                
		if ( purpose === 'graffiti' )
		{
			if ( _ItemDefinitionNameSubstrMatch( id, 'tournament_journal_' ) )
			{
				return _GetFauxItemIdForGraffiti( parseInt( InventoryAPI.GetItemAttributeValue( id, 'sticker slot 0 id' ) ));
			}
		}
		return id;
	};

	var _GetFauxItemIdForGraffiti = function( stickestickerid_graffiti )
	{
		                                                                                 
		                                                                                
		                                
		
		return InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(                
			1349, stickestickerid_graffiti );
	};

	var _GetItemIdForItemEquippedInLoadoutSlot = function( id, team )
	{
		return LoadoutAPI.GetItemID( team, _GetSlotSubPosition( id ) );
	};

	                                              
	    
	   	                                                  
	   	
	   	                                                          
	   	                                                        
	   	 
	   		                                        
	   		 
	   			                                  
	   		    
	   	    
	     
	
	var _ItemsNeededToTradeUp = function( id )
	{
		return InventoryAPI.GetNumItemsNeededToTradeUp( id );
	};

	var _GetGifter = function( id )
	{
		var xuid = InventoryAPI.GetItemGifterXuid( id );
		
		return xuid !== undefined ? xuid : '';
	};

	var _GetSet = function( id )
	{
		var setName = InventoryAPI.GetSet( id );

		return setName !== undefined ? setName : '';
	};

	var _GetModelPath = function( id, itemSchemaDef )
	{
		var isMusicKit = _ItemMatchDefName( id, 'musickit' );
		var issMusicKitDefault = _ItemMatchDefName( id, 'musickit_default' );
		var isSticker = _ItemMatchDefName( id, 'sticker' );
		var isSpray = itemSchemaDef.name === 'spraypaint';
		var isSprayPaint = itemSchemaDef.name === 'spray';
		var isFanTokenOrShieldItem = itemSchemaDef.name && itemSchemaDef.name.indexOf( 'tournament_journal_' ) != -1;
		
		                                                                    
		                                                       
		if ( isSpray || isSprayPaint || isFanTokenOrShieldItem )
			return 'vmt://spraypreview_' + id;
		else if ( isSticker )
			return 'vmt://stickerpreview_' + id;
		else if ( itemSchemaDef.hasOwnProperty( "model_player" ) || isMusicKit || issMusicKitDefault )
			return 'img://inventory_' + id;
	};

	var _GetModelPathFromJSONOrAPI = function( id )
	{
		                                
		if ( id === '' || id === undefined || id === null )
		{
			return '';
		}
		
		var pedistalModel = '';
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );
		var itemSchemaDef = JSON.parse( schemaString );
		
		if ( _GetSlotSubPosition( id ) === "flair0" )
		{
			pedistalModel = itemSchemaDef.hasOwnProperty( 'attributes' ) ? itemSchemaDef.attributes[ "pedestal display model" ] : '';
		}
		else if( _ItemHasCapability( id, 'decodable' ) )
		{
			                                  

			pedistalModel = itemSchemaDef.hasOwnProperty( "model_player" ) ? itemSchemaDef.model_player : '';
			                                                   
		}

		return ( pedistalModel === '' ) ? _GetModelPath( id, itemSchemaDef ) : pedistalModel;
	};

	var _GetLootListCount = function( id )
	{
		return InventoryAPI.GetLootListItemsCount( id );
	};

	var _GetLootListItemByIndex = function( id, index )
	{
		return InventoryAPI.GetLootListItemIdByIndex( id, index );
	};

	var _GetMarketLinkForLootlistItem = function( id )
	{
		var appID = SteamOverlayAPI.GetAppID();
		var communityUrl = SteamOverlayAPI.GetSteamCommunityURL();
		var strName = _GetName( id );
		
		return communityUrl + "/market/search?appid=" + appID + "&lock_appid=" + appID + "&q=" + strName;
	};

	var _GetToolType = function( id )
	{
		return InventoryAPI.GetToolType( id );
	};

	return {
		GetRarityColor					: _GetRarityColor,
		GetName							: _GetName,
		GetFauxReplacementItemID		: _GetFauxReplacementItemID,
		GetFauxItemIdForGraffiti		: _GetFauxItemIdForGraffiti,
        GetFormattedName                : _GetFormattedName,                                 
		IsEquipped						: _IsEquipped,
		IsEquippedForCT					: _IsEquippedForCT,
		IsEquippedForT					: _IsEquippedForT,
		IsEquippedForNoTeam				: _IsEquippedForNoTeam,
		IsEquippalbleButNotAWeapon		: _IsEquippalbleButNotAWeapon,
		AddItemToShuffle				: _AddItemToShuffle,
		RemoveItemFromShuffle			: _RemoveItemFromShuffle,
		IsItemInShuffleForTeam			: _IsItemInShuffleForTeam,
		ClearShuffle					: _ClearShuffle,
		SetShuffleEnabled				: _SetShuffleEnabled, 
		IsShuffleEnabled				: _IsShuffleEnabled, 
		IsShuffleAllowed				: _IsShuffleAllowed, 
		CountItemsInInventoryForShuffleSlot	: _CountItemsInInventoryForShuffleSlot, 
		EnsureShuffleItemEquipped		: _EnsureShuffleItemEquipped, 
		GetSlot							: _GetSlot,
		GetTeam							: _GetTeam,
		GetSlotSubPosition				: _GetSlotSubPosition,
		IsSpraySealed					: _IsSpraySealed,
		IsSprayPaint					: _IsSprayPaint,
		IsTradeUpContract				: _IsTradeUpContract,
		GetSprayTintColor				: _GetSprayTintColor,
		IsTool							: _IsTool,
		GetCapabilitybyIndex			: _GetCapabilitybyIndex,
		GetCapabilityCount				: _GetCapabilityCount,
		ItemHasCapability				: _ItemHasCapability,
		GetChosenActionItemsCount		: _GetChosenActionItemsCount,
		GetChosenActionItemIDByIndex	: _GetChosenActionItemIDByIndex,
		GetStickerSlotCount				: _GetStickerSlotCount,
		GetStickerCount					: _GetStickerCount,
		GetitemStickerList				: _GetitemStickerList,
		GetItemPickUpMethod				: _GetItemPickUpMethod,
		GetLoadoutPrice					: _GetLoadoutPrice,
		GetStoreOriginalPrice			: _GetStoreOriginalPrice,
		GetStoreSalePrice				: _GetStoreSalePrice,
		GetStoreSalePercentReduction	: _GetStoreSalePercentReduction,
		ItemPurchase					: _ItemPurchase,
		IsItemCt						: _IsItemCt,
		IsItemT							: _IsItemT,
		IsItemAnyTeam					: _IsItemAnyTeam,
		ItemsNeededToTradeUp			: _ItemsNeededToTradeUp,
		             						                                      
		ItemMatchDefName				: _ItemMatchDefName,
		ItemDefinitionNameSubstrMatch	: _ItemDefinitionNameSubstrMatch,
		GetItemDefinitionName			: _GetItemDefinitionName,
		GetGifter						: _GetGifter,
		GetSet							: _GetSet,
		GetModelPath					: _GetModelPath,
		GetModelPathFromJSONOrAPI		: _GetModelPathFromJSONOrAPI,
		GetLootListCount				: _GetLootListCount,
		GetLootListItemByIndex			: _GetLootListItemByIndex,
		IsStatTrak						: _IsStatTrak,
		GetToolType						: _GetToolType,
		GetMarketLinkForLootlistItem	: _GetMarketLinkForLootlistItem,
		GetItemIdForItemEquippedInLoadoutSlot : _GetItemIdForItemEquippedInLoadoutSlot           
	};
})();
