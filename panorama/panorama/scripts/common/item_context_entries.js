"use-strict";

var ItemContextEntires = ( function (){

	var _FilterEntries = function( populateFilterText )
	{
		var bHasFilter = populateFilterText !== "(not found)";
		
		return _Entries.filter( function( entry )
		{
			                 
			if ( entry.exclusiveFilter )
			{
				return entry.exclusiveFilter.includes( populateFilterText );
			}
			                      
			else if ( bHasFilter && entry.populateFilter )
			{
				return entry.populateFilter.includes( populateFilterText );
			}	
			
			                                                                        
			return !bHasFilter;
		} );
	};

	var _CanEquipItem = function( itemID )
	{
		return ItemInfo.GetSlotSubPosition( itemID ) && !ItemInfo.IsEquippalbleButNotAWeapon( itemID ) && LoadoutAPI.IsLoadoutAllowed();
	}

	                                                                                                    
                                             
                                                           
                                                                  
	                                                                                                    
	var _Entries = [
	  
		 
			                                                                            
			                                                                     
			                                                                                    
			                                   
				                                                                 
				            	
			  
			                              
				                                    
			 
		  
	  	
		{
			name: 'preview',
			populateFilter: ['lootlist', 'loadout', 'tradeup_items', 'tradeup_ingredients'],
			style: function (id){
				var slotsub = ItemInfo.GetSlotSubPosition(id);
				return ( ( slotsub ) && ( slotsub.startsWith( "equipment" ) || slotsub.startsWith( "grenade" ) ) ) ? '' : 'BottomSeparator';
			},
			AvailableForItem: function ( id ) {
				                                                                 
				return ( ItemInfo.GetSlotSubPosition( id ) ||
					ItemInfo.ItemMatchDefName( id, 'sticker' ) ||
					ItemInfo.ItemMatchDefName( id, 'spray' )
				);
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "InventoryItemPreview", id );
			}
		},
		{
			name: 'equip_both_teams',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				if( ItemInfo.IsItemAnyTeam(id) && (!ItemInfo.IsEquippedForCT(id) && !ItemInfo.IsEquippedForT(id)))
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{				
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'ct','t' ] );
			}
		},
		{
			                         
			name: 'equip_ct',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 'ct');
			},
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return ItemInfo.IsItemAnyTeam(id) ? '' : 'BottomSeparator';
			},
			AvailableForItem: function ( id ) {
				if((ItemInfo.IsItemCt(id) || ItemInfo.IsItemAnyTeam(id)) && !ItemInfo.IsEquippedForCT(id))
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'ct' ] );
			}
		},
		{	
			                        
			name: 'equip_t',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 't');
			},
			populateFilter: ['inspect', 'loadout'],
			ToolTip: function (id) {
				return _GetItemToReplaceName(id, 'ct');
			},
			style: function (id){
				return (ItemInfo.IsItemAnyTeam(id) || ItemInfo.IsItemT(id)) ? 'BottomSeparator' : '';
			},
			AvailableForItem: function ( id ) {
				
				if(( ItemInfo.IsItemT(id) || ItemInfo.IsItemAnyTeam(id)) && !ItemInfo.IsEquippedForT(id))
				{
					return _CanEquipItem( id );
				}
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 't' ] );
			}
		},
		{
			                            
			name: 'equip_spray',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 'noteam');
			},
			populateFilter: ['inspect', 'loadout'],
			ToolTip: function (id) {
				return _GetItemToReplaceName( id, 'noteam');
			},
			style: function (id){
				return (ItemInfo.IsItemAnyTeam(id) || ItemInfo.IsItemT(id)) ? 'BottomSeparator' : '';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'spraypaint') && !ItemInfo.IsEquippedForNoTeam(id);
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'noteam' ] );
			}
		},
		{
			          
			name: 'equip_musickit',
			CustomName: function (id) {
				return _GetItemToReplaceName(id, 'noteam');
			},
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return (ItemInfo.IsItemAnyTeam(id) || ItemInfo.IsItemT(id)) ? 'BottomSeparator' : '';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'musickit' && !ItemInfo.IsEquippedForNoTeam(id);
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				var isMusicvolumeOn = InventoryAPI.TestMusicVolume();
				if ( !isMusicvolumeOn )
				{
					$.DispatchEvent( 'ShowResetMusicVolumePopup', '' );
				}
				else
				{
					EquipItem( id, [ 'noteam' ] );
				}
			}
		},
		{
			name: 'open_watch_panel_pickem',
			AvailableForItem: function ( id ) {
				var tournament = 'tournament:' + NewsAPI.GetActiveTournamentEventID();
				return PredictionsAPI.GetMyPredictionItemIDEventSectionIndex( tournament, id ) != undefined;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'useitem',
			AvailableForItem: function ( id ) {
				if ( !InventoryAPI.IsTool( id ) ) return false;
				var season = InventoryAPI.GetItemAttributeValue( id, 'season access' );
				if ( season != undefined ) return true;                                    
				return false;
			},
			OnSelected: function( id )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_inventory_inspect.xml',
					'itemid=' + id +
					'&' + 'asyncworktype=useitem'
				);
			}
		},
		{
			name: 'usespray',
			populateFilter: ['inspect'],
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'spray');
			},
			OnSelected: function( id )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_capability_decodable.xml',
					'key-and-case=,' + id +
					'&' + 'asyncworktype=decodeable'
				);

				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'open_package',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'decodable' );
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				var keyId = '';

				if ( ItemInfo.GetChosenActionItemsCount( id, 'decodable' ) === 0 )
				{
					if ( ItemInfo.IsTool( id ) )
					{
						                                                             
						$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'decodable', id, '' );
					}
					else
					{
						UiToolkitAPI.ShowCustomLayoutPopupParameters(
							'',
							'file://{resources}/layout/popups/popup_capability_decodable.xml',
							'key-and-case=,' + id +
							'&' + 'asyncworktype=decodeable'
						);
					}

					$.DispatchEvent( 'ContextMenuEvent', '' );
					return;
				}
				
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'decodable', id, '' );
			}
		},
		{
			name: 'nameable',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'nameable' );
			},
			OnSelected:  function ( id ) {

				if( _DoesNotHaveChosenActionItems( id, 'nameable' ) )
				{
					var nameTagId = '',
					itemToNameId = id;
					
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'', 
						'file://{resources}/layout/popups/popup_capability_nameable.xml',
						'nametag-and-itemtoname=' + nameTagId + ',' + itemToNameId +
						'&' + 'asyncworktype=nameable'
					);
				}
				else
				{
					$.DispatchEvent( 'ContextMenuEvent', '' );
					$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'nameable', id, '' );
				}
			}
		},
		{
			                                                              
			name: 'can_sticker',
			populateFilter: ['inspect', 'loadout'],
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName(id, 'sticker') && ItemInfo.ItemHasCapability(id, 'can_sticker');
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_sticker', id, '' );
			}
		},
		{
			name: 'can_sticker',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability(id, 'can_sticker') &&
					ItemInfo.GetStickerSlotCount(id) > ItemInfo.GetStickerCount(id);
					
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_sticker', id, '' );
			}
		},
		{
			name: 'remove_sticker',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id, 'can_sticker' ) && ItemInfo.GetStickerCount(id) > 0;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );

				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_capability_can_sticker.xml',
					'sticker-and-itemtosticker=remove' + ',' + id + 
					'&' + 'asyncworktype=remove_sticker'
				);
			}
		},
		{
			name: 'recipe',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemMatchDefName( id, 'recipe' );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'can_stattrack_swap',
			AvailableForItem: function ( id ) {
				return ItemInfo.ItemHasCapability( id,'can_stattrack_swap' ) && InventoryAPI.IsTool( id );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_stattrack_swap', id, '' );
			}
		},
		{
			name: 'flair',
			populateFilter: ['inspect', 'loadout'],
			style: function (id){
				return 'BottomSeparator';
			},
			AvailableForItem: function ( id ) {
				return ItemInfo.GetSlotSubPosition(id) === 'flair0' && !ItemInfo.IsEquippedForNoTeam(id);
			},
			OnSelected: function( id )
			{
				$.DispatchEvent( 'ContextMenuEvent', '' );
				EquipItem( id, [ 'noteam' ] );
			}
		},
		{
			name: 'journal',
			AvailableForItem: function ( id ) {
				return false;                                
				var campaignSeason = InventoryAPI.GetItemAttributeValue( id, 'season access' );
				var deployDate = InventoryAPI.GetItemAttributeValue( id, 'deployment date' );
				return ItemInfo.GetSlotSubPosition(id) === 'flair0' && campaignSeason >= 3 && deployDate != undefined;
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'openloadout',
			AvailableForItem: function ( id ) {
				var slotsub = ItemInfo.GetSlotSubPosition(id);
				return ( slotsub ) && ( slotsub !== 'c4' ) && !slotsub.startsWith( "equipment" ) && !slotsub.startsWith( "grenade" );
			},
			OnSelected:  function ( id ) {
				                                         
				var teamNum = ( ItemInfo.GetTeam( id ).search( 'Team_T' ) === -1 ) ? 3 : 2;
				$.DispatchEvent( 'ContextMenuEvent', '' );
				$.DispatchEvent( "ShowLoadoutForItem", ItemInfo.GetSlot( id ) , ItemInfo.GetSlotSubPosition( id ), teamNum );
			}
		},
		{
			              
			name: 'tradeup_add',
			populateFilter: ['tradeup_items'],
			AvailableForItem: function ( id ) {
				var slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !=="melee" && slot !=="c4" && slot !=="clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id) &&
					( InventoryAPI.CanTradeUp( id ) || InventoryAPI.GetNumItemsNeededToTradeUp( id ) > 0 );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.AddCraftIngredient( id );
			}
		},
		{
			                 
			name: 'tradeup_remove',
			exclusiveFilter: ['tradeup_ingredients'],
			AvailableForItem: function ( id ) {
				var slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !=="melee" && slot !=="c4" && slot !=="clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id);
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.RemoveCraftIngredient( id );
			}
		},
		{
			                        
			name: 'open_contract',
			AvailableForItem: function ( id ) {
				return ItemInfo.IsTradeUpContract( id );
			},
			OnSelected:  function ( id ) {
				$.DispatchEvent( 'ShowTradeUpPanel' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}
		},
		{
			name: 'sell',
			style: function (id){
				return 'TopSeparator';
			},
			AvailableForItem: function ( id ) {
				return InventoryAPI.IsMarketable( id );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'PlaySoundEffect', 'inventory_inspect_sellOnMarket', 'MOUSE' );
				$.DispatchEvent( 'ContextMenuEvent', '' );
				InventoryAPI.SellItem( id );
			}
		},
		{
			name: 'delete',
			style: function (id){
				return !InventoryAPI.IsMarketable( id ) ? 'TopSeparator' : '';
			},
			AvailableForItem: function ( id ) {
				return InventoryAPI.IsDeletable( id );
			},
			OnSelected: function ( id ) {
				$.DispatchEvent( 'ContextMenuEvent', '' );
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_inventory_inspect.xml',
					'itemid=' + id +
					'&' + 'asyncworktype=delete' +
					'&' + 'asyncworkbtnstyle=Negative'
				);
			}
		}
	];

	                                                                                                    
	                                
	                                                                                                    
	var _GetItemToReplaceName = function( id, team )
	{
		var currentEquippedItem = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot( id, team );
		if ( currentEquippedItem && currentEquippedItem !== '0' )
		{
			$.GetContextPanel().SetDialogVariable( "item_name", _GetNameWithRarity( currentEquippedItem ) );
			return $.Localize( 'inv_context_equip', $.GetContextPanel() );
		}
		return 'WRONG CONTEXT -_GetItemToReplaceName()' + id;
	};

	var _GetNameWithRarity = function( id )
	{
		var rarityColor = ItemInfo.GetRarityColor( id );
		return '<font color="' + rarityColor + '">' + ItemInfo.GetName( id ) + '</font>';
	};

	var EquipItem = function( id, team )
	{
		var slot = ItemInfo.GetSlotSubPosition( id );
		team.forEach( element => LoadoutAPI.EquipItemInSlot( element, id, slot ) );
	};

	var _DoesNotHaveChosenActionItems = function( id, capability )
	{
		return ( ItemInfo.GetChosenActionItemsCount( id, capability ) === 0 && !ItemInfo.IsTool( id ) );
	};

	return {
		FilterEntries: _FilterEntries                                                   
	};
})();
