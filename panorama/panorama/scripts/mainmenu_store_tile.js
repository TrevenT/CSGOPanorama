              
   
                                                            
'use strict';

var MainMenuStoreTile = ( function()
{
	var elItem = $.GetContextPanel();

	var _Init = function()
	{
		                         
		var id = elItem.Data().oData.id;
		var activationType = elItem.Data().oData.activationType;
		var isNewRelease = elItem.Data().oData.isNewRelease;
		var isNewTagOverride = elItem.Data().oData.newTagOverride;
		var useItemId = elItem.Data().oData.useItemId;
		var isProTeam = elItem.Data().oData.isProTeam;
		var isMarketItem = activationType === 'market';

		                  
		var elImage = elItem.FindChildInLayoutFile( 'StoreItemImage' );
		var LootListItemID = '';

		if( ItemInfo.GetLootListCount( id ) > 0 )
			LootListItemID = InventoryAPI.GetLootListItemIdByIndex( id, 0 );

		elImage.itemid = ( !isMarketItem && !useItemId && LootListItemID ) ? LootListItemID : id;

		var elName = elItem.FindChildInLayoutFile( 'StoreItemName' );
		elName.text = ItemInfo.GetName( id );
		
		var elStattrak = elImage.FindChildInLayoutFile( 'StoreItemStattrak' );
		elStattrak.SetHasClass( 'hidden', !ItemInfo.IsStatTrak( id ) );

		var elNewHighlight = elImage.FindChildInLayoutFile( 'StoreItemNew' );
		elNewHighlight.SetHasClass( 'hidden', !isNewRelease || id !== isNewRelease );

		var elSale = elItem.FindChildInLayoutFile( 'StoreItemSalePrice' );
		var elPrecent = elItem.FindChildInLayoutFile( 'StoreItemPercent' );
		var reduction = ItemInfo.GetStoreSalePercentReduction( id, 1 );

		if ( reduction )
		{
			elSale.visible = true;
			elSale.text = ItemInfo.GetStoreOriginalPrice( id, 1 );

			elPrecent.visible = true;
			elPrecent.text = reduction;
		}
		else
		{
			elSale.visible = false;
			elPrecent.visible = false;
		}

		var elPrice = elItem.FindChildInLayoutFile( 'StoreItemPrice' );
		elPrice.text = ( isMarketItem ) ? $.Localize( '#SFUI_Store_Market_Link' ) : ItemInfo.GetStoreSalePrice( id, 1 );

		if( isProTeam )
		{
			elItem.SetPanelEvent( 'onactivate', _ShowDecodePopup.bind( undefined,id, id, 'newstore' ));
		}
		else
		{
			_OnActivateStoreItem( elItem, id, activationType );
		}
	};

	var _OnActivateStoreItem = function( elItem, id, type )
	{
		if ( type === "market" )
		{
			elItem.SetPanelEvent( 'onactivate', _OpenOverlayToMarket.bind( undefined, id ));
		}
		else if( ItemInfo.ItemHasCapability( id, 'decodable' ) )
		{
			var displayItemId = '';

			if( ItemInfo.GetLootListCount( id ) > 0 )
				displayItemId= InventoryAPI.GetLootListItemIdByIndex( id, 0 );
			
			if( displayItemId )
				elItem.SetPanelEvent( 'onactivate', _ShowDecodePopup.bind( undefined, id, displayItemId, type ) );
			else
				elItem.SetPanelEvent( 'onactivate', _ShowInpsectPopup.bind( undefined, id, type ) );
		}
		else
			elItem.SetPanelEvent( 'onactivate', _ShowInpsectPopup.bind( undefined, id, type ) );
	};

	var _OpenOverlayToMarket = function( id )
	{
		var m_AppID = SteamOverlayAPI.GetAppID();
		var m_CommunityUrl = SteamOverlayAPI.GetSteamCommunityURL();
		var strSetName = InventoryAPI.GetItemSet( id );
		
		SteamOverlayAPI.OpenURL( m_CommunityUrl + "/market/search?q=&appid=" + m_AppID + "&lock_appid=" + m_AppID + "&category_" + m_AppID + "_ItemSet%5B%5D=tag_" + strSetName );
		StoreAPI.RecordUIEvent( "ViewOnMarket" );
	};

	var _ShowDecodePopup = function( id, displayItemId, type )
	{
		                                                                                     
		var strExtraSettings = '';
		if ( type === 'newstore' )
		{	                                                                                   
			strExtraSettings = '&overridepurchasemultiple=1';
		}

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_decodable.xml',
			'key-and-case=' + '' + ',' + displayItemId
			+ '&' +
			'asyncworkitemwarning=no'
			+ '&' +
			'asyncforcehide=true'
			+ '&' +
			'storeitemid=' + id
			+ strExtraSettings
		);
	};

	var _ShowInpsectPopup = function( id )
	{
		                                                            
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id
			+ '&' +
			'inspectonly=false'
			+ '&' +
			'asyncworkitemwarning=no'
			+ '&' +
			'storeitemid=' + id,
			'none'
		);
	};
	

	return {
		Init: _Init
	};
} )();



