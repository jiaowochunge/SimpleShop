/**
 *
 */
package ai.bell.shop.config;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import com.github.wxpay.sdk.IWXPayDomain;
import com.github.wxpay.sdk.WXPayConfig;
import com.github.wxpay.sdk.WXPayConstants;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author john
 *
 */
@Component
@ConfigurationProperties(prefix = "wxpay")
@Data
@EqualsAndHashCode(callSuper = false)
public class MyWXPayConfig extends WXPayConfig {

	@Autowired
	ResourceLoader loader;

	private byte[] certData;

	private String appId;

	private String mchId;

	private String key;

	private String certPath;

	private int httpConnectionTimeoutMs;

	private int httpReadTimeoutMs;

	private String payCallback;

	private String refundCallback;

	private String sandboxKey;

	@PostConstruct
	public void init() throws Exception {
		Resource resource = loader.getResource(this.certPath);
		InputStream certStream = resource.getInputStream();
		this.certData = new byte[(int) resource.contentLength()];
		certStream.read(this.certData);
		certStream.close();
	}

	@Override
	public String getAppID() {
		return this.appId;
	}

	@Override
	public String getMchID() {
		return this.mchId;
	}

	@Override
	public String getKey() {
		if (this.sandboxKey != null) {
			return this.sandboxKey;
		}
		return this.key;
	}

	@Override
	public InputStream getCertStream() {
		ByteArrayInputStream certBis = new ByteArrayInputStream(this.certData);
		return certBis;
	}

	@Override
	public IWXPayDomain getWXPayDomain() {
		return new IWXPayDomain() {
			@Override
			public void report(String domain, long elapsedTimeMillis, Exception ex) {
				// 上报异常
			}
			@Override
			public DomainInfo getDomain(WXPayConfig config) {
				return new IWXPayDomain.DomainInfo(WXPayConstants.DOMAIN_API, true);
			}
		};
	}

	@Override
	public int getHttpConnectTimeoutMs() {
		return this.httpConnectionTimeoutMs;
	}

	@Override
	public int getHttpReadTimeoutMs() {
		return this.httpReadTimeoutMs;
	}

	public String getPayCallback() {
		return payCallback;
	}

	public String getRefundCallback() {
		return refundCallback;
	}

	@Override
	public boolean hasSandboxKey() {
		return sandboxKey != null;
	}

}
