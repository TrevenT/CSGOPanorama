"use strict";

var MainMenuStore = ( function()
{
	var m_activeTab = null;
	var m_itemNewReleases = null;
	var m_elStore = $.GetContextPanel();
	var m_pendingItemsToPopulateByTab = {};
	var m_pendingItemsToPopulateScheduled = {};
	
	var _Init = function()
	{
		_CheckLicenseScreen();

		if ( !MyPersonaAPI.IsConnectedToGC() )
			return;

		var bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === "perfectworld" );
		var itemsByCategory = {};

		                                               
		if ( ( NewsAPI.GetActiveTournamentEventID() !== 0 )
			&& ( '' !== StoreAPI.GetStoreItemSalePrice( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_sticker, 0 ), 1, '' ) )
			)
		{
			m_elStore.SetDialogVariable( "tournament_name", $.Localize( "#CSGO_Tournament_Event_Location_" + NewsAPI.GetActiveTournamentEventID() ) );
			itemsByCategory.tournament = _OperationTournamentSetupObj();
		}

		                                                   
		var nSeasonIndex = GameTypesAPI.GetActiveSeasionIndexValue();
		nSeasonIndex = null;                                                                                              
		OperationUtil.ValidateOperationInfo( nSeasonIndex );
		var oStatus = OperationUtil.GetOperationInfo();

		if ( nSeasonIndex && nSeasonIndex > 0 )
		{
			var opname = GameTypesAPI.GetActiveSeasionCodeName();
			if ( !opname )
			{
				opname = 'op' + ( nSeasonIndex + 1 );
			}
			m_elStore.SetDialogVariable( "operation_name", $.Localize( "#" + opname + '_name' ) );
		}

		if( OperationUtil.ValidateCoinAndSeasonIndex( nSeasonIndex, oStatus.nCoinRank ) )
		{
			itemsByCategory.operation = _OperationStoreSetupObj( nSeasonIndex );
		}

		                                       
		var aProTeams = _ProTeamsItems();

		if ( aProTeams )
		{
			itemsByCategory.proteams = aProTeams;
		}

		                                                             
		itemsByCategory = _GetStoreItems( itemsByCategory );

		                                                                             
		if ( itemsByCategory.newstore && itemsByCategory.newstore.length < 2 )
		{
		   	                                          
		   	                                                                                                       
		   	 
		   		                                                          
		   	 
			m_itemNewReleases = itemsByCategory.newstore[0];
			delete itemsByCategory.newstore;

			if ( bPerfectWorld )
			{
				if ( !itemsByCategory.store )
				{
					itemsByCategory.store = [];
				}

				itemsByCategory.store.unshift( m_itemNewReleases );
			}
		}
		else
		{
			m_itemNewReleases = null;
		}

		                                                                            
		                                                    

		_MakeCarousel( itemsByCategory );
		_SortTabs();
		_AccountWalletUpdated();
	};

	var _OperationTournamentSetupObj = function()
	{
		var tournament = [
			{
				snippet_name: "TournamentStore",
				load_func: function ( elpanel ) {
					var itemsCount = g_ActiveTournamentTeams.length;
					var randomItemsIndex = [];
					var count = 0;
			
					while ( count < 7 )
					{
						var random = _GetRandom( 0, itemsCount );
						var filteredIndexes = randomItemsIndex.filter(index => index === random );
			
						if( filteredIndexes.length === 0  )
						{
							randomItemsIndex.push(random);
							count++;
						}
					}
			
					var elImagesContainer = elPanel.FindChildInLayoutFile( 'id-store-tournament-items-container' );
					var itemTypes = [
						'itemid_sticker',
						'itemid_pass'
					];
					var offset = 78;
			
					_ShowSaleTag( );
					
					for( var i = 0; i < randomItemsIndex.length ; i++ )
					{
						var elImage = elImagesContainer.FindChildInLayoutFile( 'id-store-tournament-item' + i );
						var defIndex = 0;
			
						if( i === 0 )
						{
							var randomItemType = _GetRandom( 0, itemTypes.length );
							defIndex = g_ActiveTournamentInfo[ itemTypes[ randomItemType ]];
						}
						else
						{
							                                     
							var randomItemType = _GetRandom( 0, itemTypes.length - 1 );
							defIndex = g_ActiveTournamentTeams[ randomItemsIndex[i]][ itemTypes[ randomItemType ]];
						}
						
						elImage.itemid = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defIndex, 0 );
						elImage.style.x = ( offset*i ) + 'px';
						var scaleOffset = 1 - ( 0.08 * i );
						elImage.style.transform = 'scale3d( '+ scaleOffset +','+ scaleOffset +','+ scaleOffset +')';
						elImage.style.zIndex = 10-i;
						if( i > randomItemsIndex.length/2 )
						{
							elImage.style.blur = 'gaussian( 4, 4,' + 1 +')';
						}
					}
			
					function _ShowSaleTag ()
					{
						var itemsThatGoOnSale = [
							g_ActiveTournamentInfo.itemid_sticker,
							g_ActiveTournamentInfo.itemid_pass,
							g_ActiveTournamentInfo.itemid_pack,
							g_ActiveTournamentInfo.itemid_charge
						];
			
						var itemsWithSaleReduction = [];
						itemsThatGoOnSale.forEach( itemDefIndex =>
						{
							var reduction = ItemInfo.GetStoreSalePercentReduction( itemDefIndex, 1 );
							
							if ( reduction )
							{
								var oItem = { defindex: itemDefIndex, reduction: reduction };
								itemsWithSaleReduction.push( oItem );
							}
						} );
			
						var aSorted = itemsWithSaleReduction.sort(function (a, b) {
							return parseInt( a.reduction ) - parseInt( b.reduction );
						});
						
						var elPrecent = elPanel.FindChildInLayoutFile( 'StorePanelTournamentSaleTagLabel' );
						elPrecent.SetHasClass( 'hidden', aSorted.length < 1 ? true : false );
						
						if ( aSorted.length >= 1 )
						{
							var itemName = aSorted[0].defindex === g_ActiveTournamentInfo.itemid_sticker ?
								$.Localize( '#store_tournament_reduction_strickers' ) :
								ItemInfo.GetName( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( aSorted[0].defindex , 0 ));
							
							elPrecent.SetDialogVariable( 'reduction', aSorted[ 0 ].reduction );
							elPrecent.SetDialogVariable( 'reduction_name', itemName );
						}
					}
					
					elPanel.SetDialogVariable( 'tournament-name', $.Localize('#CSGO_Tournament_Event_NameShort_'+ g_ActiveTournamentInfo.eventid) );
					                                                                                       
					                                                   
			
					                             
					    
					   	                               
					   	                                 
			
					   		                                                                               
					   		                                                
			
					   		                                                    
					   		 
					   			                                    
					   			                                               
					   				       
			
					   			                                                                                            
					   			                   
					   				       
			
					   			                                                                                 
					   			                                                                                                   
					   			                                                                         
					   			                                                                  
					   		 
			
					   		                                                              
					   	 
					     
				}
			}
		];

		return tournament;
	};

	var _OperationStoreSetupObj = function( nSeasonIndex )
	{
		var operation = [
			{
				snippet_name: "OperationStore",
				load_func: function ( elpanel ) {

					OperationUtil.ValidateOperationInfo( nSeasonIndex );
					var aRewards = OperationUtil.GetRewardsData();
					
					function GetRandomItem ( aItemList )
					{
						var min = 0;
						var max = aItemList.length - 1;
						
						return aItemList[Math.floor(Math.random() * (max - min + 1) + min)];
					}

					function GetRandomIds( aItemIds, nNeeded )
					{
						var aIndexes = [];

						for ( var i = 0; i < nNeeded; i++ )
						{
							var temp = GetRandomItem( aItemIds );

							if( aIndexes.indexOf( temp ) > -1 )
							{
								var count = 0;
								while( aIndexes.indexOf( temp ) > -1 && count < 15 )
								{
									temp = GetRandomItem( aItemIds );
									count++;
								}
							}

							aIndexes.push( temp );
						}

						return aIndexes;
					}

					var aCharItemIds = [];
					var aItemIds = [];

					if( aRewards && ( aRewards.length > 0 ))
					{
						aRewards.forEach( function ( reward, index ) {
							                         
							if ( reward.containerType === "isCharacterLootlist" )
							{
								reward.lootlist.forEach( function ( id ) {
									aCharItemIds.push( id );
								});
							}
							else if ( reward.containerType !== "isGraffitiBox" )
							{
								reward.lootlist.forEach( function ( id ) {
									aItemIds.push( id );
								});
							}
						});

						var aIds = GetRandomIds( aCharItemIds, 2 );
						elpanel.FindChildInLayoutFile( 'id-store-operation-char0' ).itemid = aIds[0];
						elpanel.FindChildInLayoutFile( 'id-store-operation-char1' ).itemid = aIds[1];

						aIds= [];
						aIds = GetRandomIds( aItemIds, 3 );
						elpanel.FindChildInLayoutFile( 'id-store-operation-item0' ).itemid = aIds[0];
						elpanel.FindChildInLayoutFile( 'id-store-operation-item1' ).itemid = aIds[1];
						elpanel.FindChildInLayoutFile( 'id-store-operation-item2' ).itemid = aIds[2];

						var elBalance = m_elStore.FindChildInLayoutFile( 'id-store-operation-balance-container' );
						var isPremium = OperationUtil.GetOperationInfo().bPremiumUser;
						var nBalance = OperationUtil.GetOperationInfo().nRedeemableBalance;
						elBalance.visible = isPremium;
						
						if( isPremium )
						{
							m_elStore.SetDialogVariableInt( "your_stars", nBalance );
						}
					}
				}
			}
		];
		return operation;
	};

	var _ProTeamsItems = function()
	{
		var aItemIds = [ 
			InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 4743 , 0 ),
			InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 4744 , 0 ),
			InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 4745 , 0 )
		];

		var firstIdPrice = ItemInfo.GetStoreSalePrice( aItemIds[0], 1 );
		                             
		if( firstIdPrice === "" || firstIdPrice === undefined || firstIdPrice === null || !_BAllowDisplayingItemInStore( aItemIds[0] ))
		{
			return null;
		}
		
		                                   
		var proteams = [
			{
				snippet_name: "ProTeams",
				load_func: function ( elpanel ) {
					
					aItemIds.forEach( id => {
							var elItem = $.CreatePanel( 'Panel', elpanel, id );
							elItem.Data().oData = {
								id: id,
								useItemId: true,
								isProTeam: true,
							}

							elItem.BLoadLayout( "file://{resources}/layout/mainmenu_store_tile.xml", false, false );
						}
					)
				}
			}
		];

		return proteams
	}

	var _GetRandom = function ( min, max )
	{
		return Math.floor(Math.random() * (max - min)) + min;
	};

	var _ActionBuyLicense = function ()
	{
		var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
		LicenseUtil.BuyLicenseForRestrictions( restrictions );
	};

	var _CheckLicenseScreen = function()
	{
		var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
		
		var elBanner = m_elStore.FindChildInLayoutFile( 'StorePanelLicenseBanner' );
		elBanner.SetHasClass( 'hidden', restrictions === false );
		if ( restrictions )
		{
			elBanner.FindChildInLayoutFile( 'StorePanelLicenseBannerText' ).text = restrictions.license_msg;
			elBanner.FindChildInLayoutFile( 'StorePanelLicenseBannerButton' ).Children()[0].text = restrictions.license_act;
		}

		var elMainMenuInput = m_elStore;
		while ( elMainMenuInput ) {
			elMainMenuInput = elMainMenuInput.GetParent();
			if ( elMainMenuInput.id === 'MainMenuInput' )
				break;
		}
		if ( elMainMenuInput )
		{
			elMainMenuInput.SetHasClass( 'steam-license-restricted', restrictions !== false );
		}
	}

	var _BAllowDisplayingItemInStore = function( FauxItemId )
	{
		                                                                                                       
		var idToCheckForRestrictions = FauxItemId;
		                                                                     
		var bIsCouponCrate = InventoryAPI.IsCouponCrate( idToCheckForRestrictions );
		if( bIsCouponCrate && ItemInfo.GetLootListCount( idToCheckForRestrictions ) > 0 )
		{
			idToCheckForRestrictions = InventoryAPI.GetLootListItemIdByIndex( idToCheckForRestrictions, 0 );
		}
		                         
		var sDefinitionName = InventoryAPI.GetItemDefinitionName( idToCheckForRestrictions );
		if ( sDefinitionName === "crate_stattrak_swap_tool" )
			return true;
		                       
		var bIsDecodable = ItemInfo.ItemHasCapability( idToCheckForRestrictions, 'decodable' );
		var sRestriction = bIsDecodable ? InventoryAPI.GetDecodeableRestriction( idToCheckForRestrictions ) : null;
		if ( sRestriction === "restricted" || sRestriction === "xray" )
		{
			                                                                                                                                                              
			return false;
		}
		                                
		return true;
	}

	var _CouponsSearchFilterCallback = function( strAction ) {
		var elTextControl = $.GetContextPanel().FindChildInLayoutFile( 'CouponsSearchBarFilterText' );
		if ( !elTextControl ) return;

		                            
		var strPageName = 'Page-1';

		                         
		var strFilterString = elTextControl.text;
		if ( strAction === 'clear' || strAction === 'browse' )
			strFilterString = '';
		var arrSearchTokens = strFilterString.toLowerCase().split( /[\s\|]/ ).filter( subtoken => subtoken ? true : false );
		if ( !arrSearchTokens.length )
			strFilterString = '';

		                                                                                                                                                            
		var itemsByCategory = {};
		itemsByCategory = _GetStoreItems( itemsByCategory, strFilterString );

		                     
		                                                    

		                                        
		var results = [];
		if ( itemsByCategory.coupons && itemsByCategory.coupons.length > 8 && arrSearchTokens.length > 0 )
		{
			for ( var j = 0; j < itemsByCategory.coupons.length; ++ j )
			{
				var getNameId = '';
				var obj = itemsByCategory.coupons[j];
				                                           
				if( typeof obj === "object" && obj.linkedid )
				{
					getNameId = obj.linkedid;
				}
				else
				{
					getNameId = obj;
				}
				
				var strItemName = ItemInfo.GetName( getNameId );
				if ( !strItemName ) continue;
				strItemName = strItemName.toLowerCase();

				var hasKeySearchToken = true;
				arrSearchTokens.forEach( subtoken => hasKeySearchToken = hasKeySearchToken && ( strItemName.indexOf( subtoken ) >= 0 ) );
				if ( hasKeySearchToken )
					results.push( obj );
			}

			                                                            
			if ( results.length <= 0 )
			{	                                         
				itemsByCategory.coupons = itemsByCategory.coupons.slice( 0, 8 );
				var elTextControlErrorLabel = $.GetContextPanel().FindChildInLayoutFile( 'CouponsSearchBarFilterError' );
				elTextControlErrorLabel.SetHasClass( 'hidden', false );
				return;
			}
		}
		if ( results.length > 0 )
		{	                                                         
			strPageName = 'Page-2';
			itemsByCategory.coupons = itemsByCategory.coupons.slice( 0, 8 ).concat( results );
		}

		                                                                
		if ( !strFilterString )
		{
			strPageName = 'Page-0';
			if ( strAction === 'browse' )
				strPageName = 'Page-2';
		}

		                        
		var prop = 'coupons';
		var elCarousel = _MakeIndividualCarousel( itemsByCategory.coupons, prop );

		                                                              
		for ( var i = 0; i < 9; ++ i ) {
			if ( m_pendingItemsToPopulateScheduled.hasOwnProperty( prop ) &&
				m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled ) {
					$.CancelScheduled( m_pendingItemsToPopulateScheduled[prop].m_hScheduled );
					_ScheduledPopulateCarousel( prop );
				}
		}

		                 
		if ( strFilterString )
		{
			var elTextControlNew = $.GetContextPanel().FindChildInLayoutFile( 'CouponsSearchBarFilterText' );
			elTextControlNew.text = strFilterString;

			                                                                                                       
			                                                     
		}

		if ( strPageName === 'Page-1' )
		{
			var elTextControlErrorLabel = $.GetContextPanel().FindChildInLayoutFile( 'CouponsSearchBarFilterError' );
			elTextControlErrorLabel.SetHasClass( 'hidden', false );
		}

		                                              
		var elPageChild = elCarousel.FindChildInLayoutFile( strPageName );
		if ( elPageChild )
			elCarousel.SetSelectedChild( elPageChild );

		                                                                
		if ( results.length > 0 )
		{
			var elPage0 = elCarousel.FindChildInLayoutFile( 'Page-0' );
			if ( elPage0 ) {
				elPage0.SetAttributeString( "on-carousel-select-action", 'couponsreset' );
			}
		}
	}

	var _GetStoreItems = function( itemsByCategory, bOptionalFullSearchResults )
	{
		var count = StoreAPI.GetBannerEntryCount();
		var bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === "perfectworld" );

		if ( !count || count < 1 )
			return itemsByCategory;
		
		if ( !itemsByCategory )
		{
			itemsByCategory = {};
		}
	
		for ( var i = 0; i < count; i++ )
		{
			var ItemId = StoreAPI.GetBannerEntryDefIdx( i );
			var FauxItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( ItemId, 0 );

			                                     
			if ( !bPerfectWorld &&
				InventoryAPI.IsTool( FauxItemId ) &&
				( InventoryAPI.GetItemCapabilityByIndex( FauxItemId, 0 ) === 'decodable' )
			)
			{
				if ( !itemsByCategory.keys )
				{
					itemsByCategory.keys = [];
				}
				
				itemsByCategory.keys.push( FauxItemId );
			}
			else if ( StoreAPI.IsBannerEntryMarketLink( i ) === true )
			{
				if ( !itemsByCategory.market )
				{
					itemsByCategory.market = [];
				}
				
				itemsByCategory.market.push( FauxItemId );
			}
			else if ( StoreAPI.GetBannerEntryCustomFormatString( i ) === "new" )
			{
				if ( !_BAllowDisplayingItemInStore( FauxItemId ) )
					continue;

				if ( !itemsByCategory.newstore )
				{
					itemsByCategory.newstore = [];
				}
				
				itemsByCategory.newstore.push( FauxItemId );
			}
			else if ( StoreAPI.GetBannerEntryCustomFormatString( i ) === "coupon" )
			{
				if ( !_BAllowDisplayingItemInStore( FauxItemId ) )
					continue;

				if ( !itemsByCategory.coupons )
				{
					itemsByCategory.coupons = [];
				}

				                                                      
				if ( itemsByCategory.coupons.length == 4 )
				{
					itemsByCategory.coupons.push( { snippet_name: 'CouponsSearchBarItemSnippet', load_func: function( elItem ) {
						elItem.SetHasClass( 'store-panel__carousel__coupons_searchitem', true );
					} } );
					itemsByCategory.coupons.push( { snippet_name: 'CouponsSearchBarItemDummy', load_func: function( elItem ) {} } );
					itemsByCategory.coupons.push( { snippet_name: 'CouponsSearchBarItemDummy', load_func: function( elItem ) {} } );
					itemsByCategory.coupons.push( { snippet_name: 'CouponsSearchBarItemDummy', load_func: function( elItem ) {} } );
				}

				if ( itemsByCategory.coupons.length > 4 )
				{
					if ( bOptionalFullSearchResults ) {
						                                       
					} else {
						continue;                                              
					}
				}

				var sLinkedCoupon = StoreAPI.GetBannerEntryLinkedCoupon( i );
				if ( sLinkedCoupon )
				{
					var LinkedItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( parseInt( sLinkedCoupon ), 0 );
					                                                                                                                              
					itemsByCategory.coupons.push( { id:FauxItemId, linkedid: LinkedItemId, snippet_name: 'LinkedStoreEntry' } );
				}
				else
				{
					itemsByCategory.coupons.push( FauxItemId );
				}
			}
			else
			{
				if ( !_BAllowDisplayingItemInStore( FauxItemId ) )
					continue;

				if ( !itemsByCategory.store )
				{
					itemsByCategory.store = [];
				}

				if ( !PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() ) &&
					!bPerfectWorld &&
					itemsByCategory.store &&
					( itemsByCategory.store.indexOf( 'prime' ) === -1 ))
				{
					itemsByCategory.store.push( 'prime' );

					                                                                           
					                                                                                  
					var nCurrentLvl = FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() );
					if ( ( nCurrentLvl > 1 ) && ( nCurrentLvl % 2 == 0 ) )
					{
						itemsByCategory.prime = [];
						itemsByCategory.prime.push( 'prime' );
					}
				}

				itemsByCategory.store.push( FauxItemId );
			}
		}

		return itemsByCategory;
	};

	var _GetCoupons = function( itemsByCategory )
	{
		var count = InventoryAPI.GetCacheTypeElementsCount( "Coupons" );
		var bCheckedExpirationTimestamp = false;
		
		if ( count > 0 )
		{
			for ( var i = 0; i < count; i++ )
			{
				var CouponDefIdx = InventoryAPI.GetCacheTypeElementFieldByIndex( "Coupons", i, "defidx" );
				if ( !bCheckedExpirationTimestamp )
				{	                                       
					bCheckedExpirationTimestamp = true;
					var ExpirationUTC = InventoryAPI.GetCacheTypeElementFieldByIndex( "Coupons", i, "expiration_date" );
					
					                                                    
					var numSec = StoreAPI.GetSecondsUntilTimestamp( ExpirationUTC );
					if ( numSec <= 1 )
						break;
				}
				
				var CouponId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( CouponDefIdx, 0 );

				if ( !itemsByCategory.coupons )
				{
					itemsByCategory.coupons = [];

					if ( m_itemNewReleases )
					{
						itemsByCategory.coupons.push( m_itemNewReleases );
					}
				}
				
				itemsByCategory.coupons.push( CouponId );

				                                                
				if ( itemsByCategory.coupons.length >= 4 ) break;
			}
		}

		return itemsByCategory;
	};

	var _MakeCarousel = function( itemsByCategory )
	{
		for ( var prop in itemsByCategory )
		{
			if ( itemsByCategory.hasOwnProperty( prop ) )
			{
				m_pendingItemsToPopulateByTab[prop] = itemsByCategory[ prop ];
				_MakeTabBtn( 'CarouselContainer-', prop );
			}
		}
	};

	var _MakeIndividualCarousel = function ( itemsList, prop )
	{
		if ( m_pendingItemsToPopulateScheduled.hasOwnProperty( prop ) )
		{
			if ( m_pendingItemsToPopulateScheduled[prop].m_hScheduled )
			{
				$.CancelScheduled( m_pendingItemsToPopulateScheduled[prop].m_hScheduled );
				m_pendingItemsToPopulateScheduled[prop].m_hScheduled = null;
			}
			delete m_pendingItemsToPopulateScheduled[prop];
		}
		m_pendingItemsToPopulateScheduled[prop] = {};
		m_pendingItemsToPopulateScheduled[prop].m_itemsList = itemsList;
		m_pendingItemsToPopulateScheduled[prop].m_idx = 0;

		var elParent = m_elStore.FindChildInLayoutFile( 'CarouselContainer-' + prop );
		
		if( !elParent )
		{
			elParent = $.CreatePanel(
				'Panel',
				m_elStore.FindChildInLayoutFile( 'StoreCarouselContiner' ),
				'CarouselContainer-' + prop,
				{
					class: 'store-panel__carousel-container hidden'
				}
			);
		}
		else
		{
			elParent.RemoveAndDeleteChildren();
		}
		
		var elCarousel = $.CreatePanel(
			'Carousel',
			elParent,
			'Carousel-' + prop
		);
		
		elCarousel.BLoadLayoutSnippet( 'StoreCarousel' );

		                                                              
		$.CreatePanel( 
			'Panel',
			elParent,
			'',
			{
				class: 'horizontal-align-left store-panel__hitblocker',
				hittest: 'true',
				onactivate: ''
			} );

		$.CreatePanel( 
			'Panel',
			elParent,
			'',
			{
				class: 'horizontal-align-right store-panel__hitblocker',
				hittest: 'true',
				onactivate: ''
			} );

		$.CreatePanel( 
			'CarouselNav',
			elParent,
			'CarouselNav-' + prop,
			{
				class: 'full-width vertical-center',
				carouselid: 'Carousel-' + prop,
				hittest: 'false'
			} );

		m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = $.Schedule( .1, _ScheduledPopulateCarousel.bind( undefined, prop ) );

		return elCarousel;
	};

	var _ScheduledPopulateCarousel = function( prop )
	{
		if ( !m_pendingItemsToPopulateScheduled.hasOwnProperty( prop ) ) return;
		m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = null;

		if ( _PrePopulateCarousel( prop ) )
			m_pendingItemsToPopulateScheduled[ prop ].m_hScheduled = $.Schedule( .1, _ScheduledPopulateCarousel.bind( undefined, prop ) );
		else
			delete m_pendingItemsToPopulateScheduled[ prop ];
	}

	var _PrePopulateCarousel = function( prop )
	{
		if ( !m_pendingItemsToPopulateScheduled[ prop ].m_itemsList )
			return false;

		if ( m_pendingItemsToPopulateScheduled[prop].m_idx >= m_pendingItemsToPopulateScheduled[prop].m_itemsList.length )
			return false;

		var elParent = m_elStore.FindChildInLayoutFile( 'CarouselContainer-' + prop );
		if ( !elParent )
			return false;

		var elCarousel = elParent.FindChildInLayoutFile( 'Carousel-' + prop );
		if ( !elCarousel )
			return false;

		_PopulateCarousel( elCarousel, m_pendingItemsToPopulateScheduled[ prop ].m_itemsList, m_pendingItemsToPopulateScheduled[prop].m_idx, prop );
		++ m_pendingItemsToPopulateScheduled[prop].m_idx;
		return true;
	}

	var _PopulateCarousel = function( elCarousel, itemList, i, type )
	{
		var itemsPerPage = ( type === "tournament" || type === "operation" || type === "proteams" ) ? 1 : 4;
		var elPage = null;

		if ( i % itemsPerPage === 0 )
		{
			elPage = $.CreatePanel( 'Panel', elCarousel, 'Page-'+(i/itemsPerPage) );
			elPage.BLoadLayoutSnippet( 'StoreCarouselPage' );
			elPage.SetHasClass( 'store-panel__carousel-page--single', ( type === "operation" || type === "proteams" ) );
		}
		else
		{
			elPage = elCarousel.FindChildInLayoutFile( 'Page-'+Math.floor(i/itemsPerPage) );
		}

		var panelName = ( typeof itemList[ i ] === "object" && type === "coupons" && itemList[ i ].linkedid ) ? 
			itemList[ i ].linkedid : itemList[ i ];
			
		var elItem = $.CreatePanel( 'Panel', elPage, panelName );
		                                                              
		
		if ( itemList[ i ] === 'prime' )
		{
			elItem.BLoadLayoutSnippet( 'StoreEntryPrimeStatus' );
			_PrimeStoreItem( elItem, itemList[ i ], type );
		}
		else if ( itemList[ i ] === 'spacer' )
		{
			elItem.BLoadLayoutSnippet( 'StoreEntrySpacer' );
		}
		else if ( typeof itemList[ i ] == "string" && InventoryAPI.IsValidItemID( itemList[ i ] ) )
		{
			                                                                   
			var activationType = type;
			if ( type === 'coupons' && itemList[ i ] === m_itemNewReleases )
				activationType = 'newstore';

			elItem.Data().oData = {
				id: itemList[ i ],
				activationType: activationType,
				isNewRelease: itemList[ i ] === m_itemNewReleases
			}

			elItem.BLoadLayout( "file://{resources}/layout/mainmenu_store_tile.xml", false, false );
		}
		                                                        
		else if( typeof itemList[ i ] === "object" && type === "coupons" && itemList[ i ].linkedid )
		{
			elItem.BLoadLayoutSnippet( itemList[ i ].snippet_name );
			var oItemIds = { 
				id:itemList[ i ].id, 
				linkedid: itemList[ i ].linkedid
			};

			_FillOutLinkedItemData( elItem, oItemIds );
			_SetOnActivateEventLinkedItemTile( elItem, oItemIds );
		}
		                                                    
		else if ( typeof itemList[ i ] == "object" && elItem.BLoadLayoutSnippet( itemList[ i ].snippet_name ) )
		{
			itemList[ i ].load_func( elItem );
		}

		if ( i % itemsPerPage === 0 )
		{
			if ( i > 0 )
			{
				elPage.AddClass( 'PreviouslyRight' );
				if ( type === 'coupons' && i == 4 )
				{
					elCarousel.SetAutoScrollEnabled( false );
					elPage.SetAttributeString( "on-carousel-select-action", 'couponssearch' );
				}
			}
			elPage.AddClass( 'store-panel__carousel-page__animations_enabled' );
		}
	};

	var _FillOutLinkedItemData = function ( elItem, oItemIds )
	{
		var LootListItemID = InventoryAPI.GetLootListItemIdByIndex( oItemIds.id, 0 );
		var elImage = elItem.FindChildInLayoutFile( 'StoreItemImage' );
		elImage.itemid = LootListItemID;

		LootListItemID = InventoryAPI.GetLootListItemIdByIndex( oItemIds.linkedid, 0 );
		elImage = elItem.FindChildInLayoutFile( 'StoreItemImageLinked' );
		elImage.itemid = LootListItemID;

		var elStattrak = elImage.FindChildInLayoutFile( 'StoreItemStattrak' );
		elStattrak.SetHasClass( 'hidden', false );

		var elName = elItem.FindChildInLayoutFile( 'StoreItemName' );
		elName.text = ItemInfo.GetName( LootListItemID );

		var elSale = elItem.FindChildInLayoutFile( 'StoreItemSalePrice' );
		var elPrecent = elItem.FindChildInLayoutFile( 'StoreItemPercent' );
		var reduction = ItemInfo.GetStoreSalePercentReduction( oItemIds.id, 1 );

		if ( reduction )
		{
			elSale.visible = true;
			elSale.text = ItemInfo.GetStoreOriginalPrice( oItemIds.linkedid, 1 ) + ' - ' +  ItemInfo.GetStoreOriginalPrice( oItemIds.id, 1 );

			elPrecent.visible = true;
			elPrecent.text = reduction;
		}
		else
		{
			elSale.visible = false;
			elPrecent.visible = false;
		}

		var elPrice = elItem.FindChildInLayoutFile( 'StoreItemPrice' );
		elPrice.text = ItemInfo.GetStoreSalePrice( oItemIds.linkedid, 1 ) + ' - ' + ItemInfo.GetStoreSalePrice( oItemIds.id, 1 );
	};

	var _SetOnActivateEventLinkedItemTile = function( elTile, oItemIds )
	{
		var OpenContextMenu = function( oItemIds )
		{
			var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParameters(
				'',
				'',
				'file://{resources}/layout/context_menus/context_menu_store_linked_items.xml',
				'itemids=' + oItemIds.id +',' + oItemIds.linkedid
			);
			contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
		};

		elTile.SetPanelEvent( 'onactivate', OpenContextMenu.bind( undefined, oItemIds ) );
		elTile.SetPanelEvent( 'oncontextmenu', OpenContextMenu.bind( undefined, oItemIds ) );
	};

	var _PrimeStoreItem = function( elItem, id, type )
	{
		elItem.SetHasClass( 'store-panel__carousel__item__prime__full', ( type === 'prime' ) ? true : false );

		elItem.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_prime_status.xml' );
		} );
	};

	var _SetCarouselSelectedChild = function( objSelectedChild )
	{
		var strAction = objSelectedChild.GetAttributeString( "on-carousel-select-action", '' );
		if ( !strAction )
			return;

		                                                         

		                                          
		                                                       
		                                   
		                                                                        
		                              
		                                                    

		if ( strAction === 'couponssearch' )
		{
			var elTextEntry = objSelectedChild.FindChildInLayoutFile( 'CouponsSearchBarFilterText' );
			if ( elTextEntry ) {
				elTextEntry.SetFocus();
			}
		}
		else if ( strAction === 'couponsreset' )
		{
			_CouponsSearchFilterCallback( 'clear' );
		}
	};

	var _MakeTabBtn = function ( prefix, type )
	{
		var elBtn = $.CreatePanel( 'RadioButton', m_elStore.FindChildInLayoutFile( 'StoreNaveBar' ), type );
		elBtn.BLoadLayoutSnippet( 'StoreNavBtn' );
		elBtn.FindChildInLayoutFile( 'StoreTabLabel' ).SetLocalizationString( '#store_tab_' + type );

		elBtn.SetPanelEvent( 'onactivate', MainMenuStore.OnNavigateTab.bind( undefined, prefix + type, type ) );
	};

	var _OnNavigateTab = function ( carouselId, tab )
	{
		                                                         
		if ( m_pendingItemsToPopulateByTab.hasOwnProperty( tab ) )
		{
			_MakeIndividualCarousel( m_pendingItemsToPopulateByTab[ tab ], tab );
			delete m_pendingItemsToPopulateByTab[tab];
		}

		                                                           
		var elCarousel = m_elStore.FindChildInLayoutFile( carouselId );
		
		if( m_activeTab )
		{
			m_activeTab.AddClass( 'hidden' );
		}

		m_activeTab = elCarousel;

		if( m_activeTab )
		{
			m_activeTab.RemoveClass( 'hidden' );
		}
	};

	var _SortTabs = function ()
	{
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'StoreNaveBar' );
		var tabList = elParent.Children();

		  
		                                                                  
		                                                                               
		                                                                            
		                          
		                                                                               
		                                                                               
		  
		var tabsorder = [ 'proteams', 'operation', 'coupons',
			'tournament', 'prime', 'newstore',
			'store', 'keys', 'market' ];

		var dict = {};
		tabsorder.forEach( ( tabid, idx ) => dict[tabid] = idx );

		var tabelements = [];
		tabelements.length = tabsorder.length;
		tabList.forEach( obj => dict.hasOwnProperty( obj.id ) ? tabelements[ dict[obj.id] ] = obj : null );

		var fnMoveToFront = obj => obj ? elParent.MoveChildBefore( obj, elParent.Children()[0] ) : null;
		tabelements.reverse();
		tabelements.forEach( fnMoveToFront );
		tabelements.reverse();

		  
		                                                                         
		                                                               
		                                                            
		 
			                                           
		 
		  

		                                                                                                                  
		var nCategoryIdx = Math.floor( Math.random() * 3 );
		fnMoveToFront( tabelements[nCategoryIdx] );
		var nCategoryIdx2 = Math.floor( Math.random() * 2 );
		fnMoveToFront( tabelements[ nCategoryIdx2 + ( ( nCategoryIdx2 >= nCategoryIdx ) ? 1 : 0 ) ] );

		_SetDefaultTabActive( elParent.Children()[0] )
	};

	var _SetDefaultTabActive = function( elTab )
	{
		$.DispatchEvent( "Activated", elTab, "mouse" );
	};

	                                                                  
	                                   
	    
	   	                         
	   	                                                  

	   	                                                          
	   	                                                                                                      
	     

	var _AccountWalletUpdated = function()
	{
		var elBalance = m_elStore.FindChildInLayoutFile( 'StoreNaveBarWalletBalance' );
		if ( ( MyPersonaAPI.GetLauncherType() === 'perfectworld' ) && (MyPersonaAPI.GetSteamType() !== 'china') )
		{
			elBalance.RemoveClass( 'hidden' );
			elBalance.text = '#Store_SteamChina_Wallet';
			return;
		}

		var balance = ( MyPersonaAPI.GetLauncherType() === 'perfectworld' ) ? StoreAPI.GetAccountWalletBalance() : '';
		if ( balance === '' || balance === undefined || balance === null )
		{
			elBalance.AddClass( 'hidden' );
		}
		else
		{
			elBalance.SetDialogVariable( 'balance', balance );
			elBalance.RemoveClass( 'hidden' );
		}
	};

	var _OpenTournamentMarketLink = function()
	{
		var appid = SteamOverlayAPI.GetAppID();
		SteamOverlayAPI.OpenURL(
			SteamOverlayAPI.GetSteamCommunityURL() +
			"/market/search?q=&category_"+appid+"_Tournament%5B%5D=tag_Tournament"+g_ActiveTournamentInfo.eventid+"&appid="+appid
		);
	}

	var _OnInventoryUpdate = function()
	{
		var nSeasonIndex = GameTypesAPI.GetActiveSeasionIndexValue();
		if( OperationUtil.ValidateOperationInfo( nSeasonIndex ) )
		{
			var isPremium = OperationUtil.GetOperationInfo().bPremiumUser;
			var nBalance = OperationUtil.GetOperationInfo().nRedeemableBalance;
			var elBalance = m_elStore.FindChildInLayoutFile( 'id-store-operation-balance-container' );
			if( elBalance )
			{
				elBalance.visible = isPremium;
				if( isPremium )
				{
					m_elStore.SetDialogVariableInt( "your_stars", nBalance );
				}
			}
		}
	}

	return {
		Init: _Init,
		CheckLicenseScreen: _CheckLicenseScreen,
		ActionBuyLicense: _ActionBuyLicense,
		AccountWalletUpdated : _AccountWalletUpdated,
		OnNavigateTab: _OnNavigateTab,
		                                                          
		SetCarouselSelectedChild : _SetCarouselSelectedChild,
		CouponsSearchFilterCallback: _CouponsSearchFilterCallback,
		OnInventoryUpdate: _OnInventoryUpdate
	};
} )();

( function()
{
	MainMenuStore.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_GcLogonNotificationReceived', MainMenuStore.CheckLicenseScreen );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_UpdateConnectionToGC', MainMenuStore.CheckLicenseScreen );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_AccountWalletUpdated', MainMenuStore.AccountWalletUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PriceSheetChanged', MainMenuStore.Init );
	$.RegisterForUnhandledEvent( 'FilterStoreCouponsDisplay', MainMenuStore.CouponsSearchFilterCallback );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', MainMenuStore.OnInventoryUpdate );
	                                                                                     
	                                                                                                            

	                                                                               
	$.RegisterEventHandler( "SetCarouselSelectedChild", $.GetContextPanel(), MainMenuStore.SetCarouselSelectedChild );
} )();