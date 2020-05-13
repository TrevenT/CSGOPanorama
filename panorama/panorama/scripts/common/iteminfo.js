'use strict';

var ItemInfo = ( function() {
	var _GetRarityColor = function( id )
	{
		return InventoryAPI.GetItemRarityColor( id );
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
		
		                                                                    
		                                                       
		if ( isSpray || isSprayPaint )
			return 'vmt://spraypreview_' + id;
		else if ( isSticker )
			return 'vmt://stickerpreview_' + id;
		else if ( itemSchemaDef.hasOwnProperty( "model_player" ) || isMusicKit || issMusicKitDefault )
			return 'img://inventory_' + id;
	};

	var _GetModelPathFromJSONOrAPI = function( id )
	{
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

	return {
		GetRarityColor					: _GetRarityColor,
		GetName							: _GetName,
		IsEquippedForCT					: _IsEquippedForCT,
		IsEquippedForT					: _IsEquippedForT,
		IsEquippedForNoTeam				: _IsEquippedForNoTeam,
		IsEquippalbleButNotAWeapon		: _IsEquippalbleButNotAWeapon,
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
		GetItemDefinitionName			: _GetItemDefinitionName,
		GetGifter						: _GetGifter,
		GetSet							: _GetSet,
		GetModelPath					: _GetModelPath,
		GetModelPathFromJSONOrAPI		: _GetModelPathFromJSONOrAPI,
		GetLootListCount				: _GetLootListCount,
		GetLootListItemByIndex			:_GetLootListItemByIndex,
		IsStatTrak						:_IsStatTrak,
		GetItemIdForItemEquippedInLoadoutSlot : _GetItemIdForItemEquippedInLoadoutSlot           
	};
})();
