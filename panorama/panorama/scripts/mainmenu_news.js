'use strict';

var NewsPanel = (function () {

	var _GetRssFeed = function()
	{
		BlogAPI.RequestRSSFeed();
	}

	var _OnRssFeedReceived = function( feed )
	{
		                                          
		var elLister = $.GetContextPanel().FindChildInLayoutFile( 'NewsPanelLister' );

		if ( elLister === undefined || elLister === null || !feed )
			return;

		elLister.RemoveAndDeleteChildren();

		feed[ 'items' ].forEach( function( item, i ) {
			var elEntry = $.CreatePanel('Panel', elLister, 'NewEntry' + i, {
				acceptsinput: true,
				onactivate: 'SteamOverlayAPI.OpenURL( "' + item.link + '" );'
			});
			elEntry.BLoadLayoutSnippet( 'news-full-entry' );
			elEntry.FindChildInLayoutFile( 'NewsHeaderImage' ).SetImage( item.imageUrl );

			var elEntryInfo = $.CreatePanel('Panel', elEntry, 'NewsInfo' + i );
			elEntryInfo.BLoadLayoutSnippet( 'news-info' );

			elEntryInfo.FindChildInLayoutFile( 'Date' ).text = item.date;
			elEntryInfo.FindChildInLayoutFile( 'Title' ).text = item.title;
			elEntryInfo.FindChildInLayoutFile( 'BodyText' ).text = item.description;

			         
			elEntry.FindChildInLayoutFile( 'NewsEntryBlurTarget' ).AddBlurPanel( elEntryInfo );
		});
	}

	return {
		GetRssFeed			: _GetRssFeed,
		OnRssFeedReceived	: _OnRssFeedReceived
	};
})();


(function () {
	NewsPanel.GetRssFeed();
	$.RegisterForUnhandledEvent("PanoramaComponent_Blog_RSSFeedReceived", NewsPanel.OnRssFeedReceived );
})();