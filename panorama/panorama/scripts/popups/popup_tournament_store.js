'use-strict';

var TournamentStore = ( function()
{
	var m_CartItems;			                                             
	var m_GetCountForCategoryFuncs;	
	var m_ItemsToCategories;
	var m_StyleForCategoriesInCart = "has-items-in-cart";                                                                      
	var m_elTournamentCart;
	var m_MaxCartSize = 100;

	                    
	var _Init = function()
	{
		m_CartItems = {};	
		m_GetCountForCategoryFuncs = {}
		m_ItemsToCategories = {};

		$( "#TournamentLogo" ).SetImage( 'file://{images}/tournaments/events/tournament_logo_'  + g_ActiveTournamentInfo.eventid + ".svg" );
		$( "#TournamentTitle" ).SetLocalizationString( '#CSGO_Tournament_Event_NameShort_' + g_ActiveTournamentInfo.eventid );
		$( "#TournamentInfo" ).SetPanelEvent( "onactivate", function ()
		{
			SteamOverlayAPI.OpenURL( 'http://www.counter-strike.net/pickem/' + g_ActiveTournamentInfo.location );
		} );

		function SetItemsToOffer(                    )
		{
			var ids = [ ...arguments ];
			var elPanel = ids.shift();                                                           
			elPanel.SetPanelEvent( 'onactivate', function () {
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParameters(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_add_to_cart.xml',
					'items=' + ids.join( ',' )
					+'&item_count_func_name=funcNumItemsInCart'
				);
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
				                                                                                       
				contextMenuPanel.FindChildTraverse( 'ItemContainer' ).Data.funcNumItemsInCart = function ( itemDefIdx )
				{
					return m_CartItems[ itemDefIdx ] ? m_CartItems[ itemDefIdx ] : 0;
				}
				$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
			} );

			function CalcItemCounts( itemIDs )
			{
				return itemIDs.reduce( function ( a, cur )
				{
					return a + ( m_CartItems[ cur ] ? m_CartItems[ cur ] : 0 );
				}, 0 );
			}

			ids.forEach( function ( id )
			{
				m_ItemsToCategories[ id ] = elPanel;
				m_GetCountForCategoryFuncs[ id ] = CalcItemCounts.bind( undefined, ids );
			} );
		}

		var elOrgPanel = $( "#Org" );
		elOrgPanel.BLoadLayoutSnippet( "ItemCategory" );
		elOrgPanel.FindChildTraverse( "CategoryImage" ).SetImage( 'file://{images_econ}/econ/stickers/' + g_ActiveTournamentInfo.location + '/'+ g_ActiveTournamentInfo.organization + '.png' );
		elOrgPanel.FindChildTraverse( "CategoryLabel" ).SetLocalizationString( "#CSGO_" + g_ActiveTournamentInfo.organization );
		_ShowSaleTag( elOrgPanel,  g_ActiveTournamentInfo.itemid_sticker );
		SetItemsToOffer( elOrgPanel, g_ActiveTournamentInfo.itemid_sticker, g_ActiveTournamentInfo.itemid_graffiti );

		if ( InventoryAPI.GetDecodeableRestriction( "capsule" ) !== "restricted" )
		{
			var elCapsules = $( "#Capsules" );
			elCapsules.BLoadLayoutSnippet( "ItemCategory" );
			elCapsules.FindChildTraverse( "CategoryImage" ).SetImage( 'file://{images_econ}/econ/weapon_cases/crate_sticker_pack_london2018_legends.png' );
			elCapsules.FindChildTraverse( "CategoryLabel" ).SetLocalizationString( "#CSGO_Store_Legends_Challengers" );
			_ShowSaleTag( elCapsules,  g_ActiveTournamentCapsules[ 0 ] );
			SetItemsToOffer.apply( undefined, [ elCapsules, ...g_ActiveTournamentCapsules ] );
		}


		var elMegaBundle = $( '#MegaBundle' );
		elMegaBundle.BLoadLayoutSnippet( "ItemCategory" );
		elMegaBundle.FindChildTraverse( "CategoryImage" ).SetImage( 'file://{images_econ}/econ/weapon_cases/london2018_bundleofall.png' );
		elMegaBundle.FindChildTraverse( "CategoryLabel" ).SetLocalizationString( "#CSGO_crate_" + g_ActiveTournamentInfo.location + "_bundle_of_all" );
		_ShowSaleTag( elMegaBundle,  g_ActiveTournamentInfo.itemid_megabundle );
		SetItemsToOffer( elMegaBundle, g_ActiveTournamentInfo.itemid_megabundle );

		function SetupTeamPurchases( elRootPanel, arrTeamList )
		{
			arrTeamList.forEach( function ( teamInfo )
			{
				var elTeamPanel = $.CreatePanel( "Panel", elRootPanel, "team_" + teamInfo.team );
				elTeamPanel.BLoadLayoutSnippet( "ItemCategory" );
				elTeamPanel.FindChildTraverse( "CategoryImage" ).SetImage( 'file://{images}/tournaments/teams/' + teamInfo.team + '.svg' );
				elTeamPanel.FindChildTraverse( "CategoryLabel" ).SetLocalizationString( "#CSGO_TeamID_" + teamInfo.teamid );

				elTeamPanel.FindChildTraverse( "CategoryImage" ).SetImage( 'file://{images}/tournaments/teams/' + teamInfo.team + '.svg' );
				elTeamPanel.FindChildTraverse( "CategoryLabel" ).SetLocalizationString( "#CSGO_TeamID_" + teamInfo.teamid );
				_ShowSaleTag( elTeamPanel, teamInfo.itemid_sticker );
				
				SetItemsToOffer( elTeamPanel, teamInfo.itemid_sticker, teamInfo.itemid_graffiti );
			} );
		}

		                                                                                           
		SetupTeamPurchases( $( "#Legends" ), g_ActiveTournamentTeams.slice( 0, 8 ) );
		SetupTeamPurchases( $( "#Challengers" ), g_ActiveTournamentTeams.slice( 8, 16 ) );
		SetupTeamPurchases( $( "#Minors" ), g_ActiveTournamentTeams.slice( 16 ) );

		m_elTournamentCart = $( "#TournamentCart" );
		$.GetContextPanel().SetDialogVariableInt( "num_items_in_cart", 0 );
		$.DispatchEvent( "PlaySoundEffect", "inventory_inspect_weapon", "MOUSE" );
	};

	function _ShowSaleTag ( elPanel, storeDefIndx )
	{
		var elPrecent = elPanel.FindChildInLayoutFile( 'SaleTagLabel' );
		var reduction = ItemInfo.GetStoreSalePercentReduction( storeDefIndx, 1 );

		elPrecent.SetHasClass( 'hidden', ( reduction === '' || reduction === undefined ) ? true : false );
		elPrecent.text = reduction;
	}

	                                 
	function GetTotalItemsInCart()
	{
		var itemArray = Object.values( m_CartItems );
		if ( itemArray.length === 0 )
			return 0;

		return itemArray.reduce( function ( a, cur )
		{
			return a + cur;
		} );
	}

	function RefreshCartCounts( itemDefIndex )
	{
		var nTotal = GetTotalItemsInCart();

		var itemCount = m_GetCountForCategoryFuncs[ itemDefIndex ]();
		var bHasItems = (typeof itemCount === "number") && itemCount > 0;
		if ( bHasItems )
		{
			m_ItemsToCategories[ itemDefIndex ].SetDialogVariableInt( "num_in_cart", itemCount );
		}
		m_ItemsToCategories[ itemDefIndex ].SetHasClass( m_StyleForCategoriesInCart, bHasItems )
		m_elTournamentCart.SetHasClass( m_StyleForCategoriesInCart, nTotal > 0 );
		m_elTournamentCart.SetDialogVariableInt( "num_in_cart", nTotal );
		var purchaseItems = BuildCartItemString();
		m_elTournamentCart.SetDialogVariable( "price", StoreAPI.GetStoreItemsSalePrice( purchaseItems ) );
	}
	
	var GetMaxItems = function ( itemDefIdx )
	{
		if ( itemDefIdx == g_ActiveTournamentInfo.itemid_megabundle )
			return 5;
		
		return 20;
	}

	var _AddItemToCart = function( itemDefIndex )
	{
		if ( GetTotalItemsInCart() >= m_MaxCartSize )
			return;

	var prevCount = m_CartItems[ itemDefIndex ];
		if ( typeof m_CartItems[ itemDefIndex ] === "number" )
		{
			if ( m_CartItems[ itemDefIndex ] < GetMaxItems( itemDefIndex ) )
				m_CartItems[ itemDefIndex ]++;
		}
		else
		{
			m_CartItems[ itemDefIndex ] = 1;
		}

		if (m_CartItems[ itemDefIndex ] !== prevCount )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		}

		RefreshCartCounts( itemDefIndex );
	}

	var _RemoveItemFromCart = function( itemDefIndex )
	{
		var prevCount = m_CartItems[ itemDefIndex ];
		if ( typeof m_CartItems[ itemDefIndex ] === "number" && m_CartItems[ itemDefIndex ] > 1 )
			m_CartItems[ itemDefIndex ]--;
		else
			delete m_CartItems[ itemDefIndex ];

		if (m_CartItems[ itemDefIndex ] !== prevCount )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		}
		RefreshCartCounts( itemDefIndex );
	}

	var BuildCartItemString = function()
	{
		return Object.keys( m_CartItems ).reduce( function ( a, itemDef, idx )
		{
			var item = ',' + itemDef;
			return a + item.repeat( m_CartItems[ itemDef ] );
		},"" );
	}

	var _PurchaseCart = function ()
	{
		var purchaseItems = BuildCartItemString();
		
		StoreAPI.StoreItemPurchase( purchaseItems );
		                                                                            
		                                                                                      
		                                      
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	}
			
	return {
		Init: _Init,
		AddItemToCart: _AddItemToCart,
		RemoveItemFromCart: _RemoveItemFromCart,
		PurchaseCart: _PurchaseCart
	};
} )();

( function()
{
	TournamentStore.Init();
	$.RegisterForUnhandledEvent( 'AddItemToCart', TournamentStore.AddItemToCart );
	$.RegisterForUnhandledEvent( 'RemoveItemFromCart', TournamentStore.RemoveItemFromCart );
} )();


