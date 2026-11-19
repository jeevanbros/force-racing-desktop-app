package in.forceracing.pitwall;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;

import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

public class MainActivity extends Activity {

    private WebView web;
    private View splash;
    private TextView status;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_main);

        web = findViewById(R.id.web);
        splash = findViewById(R.id.splash);
        status = findViewById(R.id.splash_status);

        web.setBackgroundColor(Color.parseColor("#0f1116"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.contains("127.0.0.1")) {
                    hideSplash();
                }
            }
        });
        web.setWebChromeClient(new WebChromeClient());

        if (!Python.isStarted()) {
            Python.start(new AndroidPlatform(this));
        }

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Python py = Python.getInstance();
                    Integer port = py.getModule("fr_android")
                            .callAttr("start_server")
                            .toJava(Integer.class);
                    final String url = "http://127.0.0.1:" + port + "/";
                    ui.post(new Runnable() {
                        @Override
                        public void run() {
                            web.loadUrl(url);
                        }
                    });
                } catch (final Throwable t) {
                    final String detail = buildDetail(t);
                    ui.post(new Runnable() {
                        @Override
                        public void run() {
                            if (status != null) {
                                status.setTextColor(Color.parseColor("#f87171"));
                                status.setText(detail);
                            }
                        }
                    });
                }
            }
        }, "fr-boot").start();

        // Safety net: never leave the user stuck on the splash.
        ui.postDelayed(new Runnable() {
            @Override
            public void run() {
                hideSplash();
            }
        }, 25000);
    }

    private String buildDetail(Throwable t) {
        StringBuilder sb = new StringBuilder();
        sb.append("The pit wall could not start.\n\n");
        sb.append(t.getClass().getSimpleName());
        if (t.getMessage() != null) {
            sb.append(": ").append(t.getMessage());
        }
        sb.append("\n\nClose the app and open it again. If this repeats, reinstall Force Racing.");
        return sb.toString();
    }

    private void hideSplash() {
        if (splash == null) return;
        splash.animate().alpha(0f).setDuration(260).withEndAction(new Runnable() {
            @Override
            public void run() {
                splash.setVisibility(View.GONE);
            }
        }).start();
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
