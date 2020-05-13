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

		feed[ 'items' ].forEach( function( item, i )
		{
			var elEntry = $.CreatePanel( 'Panel', elLister, 'NewEntry' + i, {
				acceptsinput: true,
				onactivate: 'SteamOverlayAPI.OpenURL( "' + item.link + '" );'
			} );
			elEntry.BLoadLayoutSnippet( 'news-full-entry' );
			elEntry.FindChildInLayoutFile( 'NewsHeaderImage' ).SetImage( item.imageUrl );

			var elEntryInfo = $.CreatePanel( 'Panel', elEntry, 'NewsInfo' + i );
			elEntryInfo.BLoadLayoutSnippet( 'news-info' );

			elEntryInfo.SetDialogVariable( 'news_item_date', item.date );
			elEntryInfo.SetDialogVariable( 'news_item_title', item.title );
			elEntryInfo.SetDialogVariable( 'news_item_body', item.description );

			         
			elEntry.FindChildInLayoutFile( 'NewsEntryBlurTarget' ).AddBlurPanel( elEntryInfo );
		} );
	};

	var _OnSteamIsPlaying = function()
	{
		$.GetContextPanel().SetHasClass( 'news-panel-style-short-entires', EmbeddedStreamAPI.IsVideoPlaying() );
	};

	var _ResetNewsEntryStyle = function()
	{
		$.GetContextPanel().RemoveClass( 'news-panel-style-short-entires' );
	};

	return {
		GetRssFeed			: _GetRssFeed,
		OnRssFeedReceived: _OnRssFeedReceived,
		OnSteamIsPlaying: _OnSteamIsPlaying,
		ResetNewsEntryStyle: _ResetNewsEntryStyle
	};
})();


(function () {
	NewsPanel.GetRssFeed();
	$.RegisterForUnhandledEvent( "PanoramaComponent_Blog_RSSFeedReceived", NewsPanel.OnRssFeedReceived );
	$.RegisterForUnhandledEvent( "PanoramaComponent_EmbeddedStream_VideoPlaying", NewsPanel.OnSteamIsPlaying );
	$.RegisterForUnhandledEvent( "StreamPanelClosed", NewsPanel.ResetNewsEntryStyle );
})();